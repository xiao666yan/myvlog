package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.CommentAdminDto;
import com.myvlog.blog.dto.CommentRequest;
import com.myvlog.blog.dto.CommentResponse;
import com.myvlog.blog.dto.UserDto;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.entity.Comment;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.enums.CommentStatus;
import com.myvlog.blog.mapper.ArticleMapper;
import com.myvlog.blog.mapper.CommentMapper;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 评论服务实现类
 * 处理文章评论的发布、树形列表展示、审核及删除逻辑
 */
@Service
@RequiredArgsConstructor
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    private final ArticleMapper articleMapper;
    private final UserMapper userMapper;

    /**
     * 发表新评论
     * @param request 评论请求参数 (内容、文章ID、父评论ID等)
     * @param currentUser 当前登录用户 (可为空，即游客评论)
     * @param httpRequest 用于获取客户端 IP 和 User-Agent
     */
    @Override
    @Transactional
    public CommentResponse addComment(CommentRequest request, User currentUser, HttpServletRequest httpRequest) {
        // 1. 验证文章是否存在及是否允许评论
        Article article = articleMapper.selectById(request.getArticleId());
        if (article == null) {
            throw new RuntimeException("Article not found");
        }
        if (!article.getAllowComment()) {
            throw new RuntimeException("Comments are disabled for this article");
        }

        // 2. 初始化评论实体
        Comment comment = new Comment();
        BeanUtils.copyProperties(request, comment);
        
        if (currentUser != null) {
            // 登录用户评论逻辑
            comment.setUserId(currentUser.getId());
            // 如果是管理员回复，自动设为“已审核”状态，并标记为“管理员回复”
            if ("admin".equals(currentUser.getRole())) {
                comment.setStatus(CommentStatus.APPROVED);
                comment.setIsAdminReply(true);
            } else {
                // 普通用户评论默认进入“待审核”状态
                comment.setStatus(CommentStatus.PENDING);
            }
        } else {
            // 游客评论逻辑：验证必填的昵称和邮箱
            if (request.getGuestName() == null || request.getGuestEmail() == null) {
                throw new RuntimeException("Guest name and email are required");
            }
            comment.setStatus(CommentStatus.PENDING);
        }

        // 3. 采集客户端元数据 (用于安全审计和反垃圾评论)
        comment.setIpAddress(getIpAddress(httpRequest));
        comment.setUserAgent(httpRequest.getHeader("User-Agent"));

        save(comment);

        // 4. 异步/同步更新文章的评论计数值
        article.setCommentCount(article.getCommentCount() + 1);
        articleMapper.updateById(article);

        return mapToResponse(comment);
    }

    /**
     * 获取文章的评论列表 (树形结构)
     * 逻辑：先查询出所有已审核的扁平化列表，然后在内存中递归组装成树
     */
    @Override
    public List<CommentResponse> getCommentsByArticleId(Long articleId) {
        // 1. 获取该文章下所有已通过审核的评论，按时间正序排列
        List<Comment> comments = list(new LambdaQueryWrapper<Comment>()
                .eq(Comment::getArticleId, articleId)
                .eq(Comment::getStatus, CommentStatus.APPROVED)
                .orderByAsc(Comment::getCreatedAt));

        // 2. 将实体转换为 Response DTO
        List<CommentResponse> dtos = comments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        // 3. 构建树形结构：找到所有根评论 (parentId 为空或 0)
        List<CommentResponse> roots = dtos.stream()
                .filter(c -> c.getParentId() == null || c.getParentId() == 0)
                .collect(Collectors.toList());

        // 4. 按父评论 ID 对回复进行分组，方便后续快速查找
        Map<Long, List<CommentResponse>> repliesMap = dtos.stream()
                .filter(c -> c.getParentId() != null && c.getParentId() != 0)
                .collect(Collectors.groupingBy(CommentResponse::getParentId));

        // 5. 递归填充子回复
        roots.forEach(root -> fillReplies(root, repliesMap));

        return roots;
    }

    /**
     * 递归填充评论回复列表
     */
    private void fillReplies(CommentResponse parent, Map<Long, List<CommentResponse>> repliesMap) {
        List<CommentResponse> replies = repliesMap.get(parent.getId());
        if (replies != null) {
            parent.setReplies(replies);
            // 继续向下递归，处理二级及以上深度的回复
            replies.forEach(reply -> fillReplies(reply, repliesMap));
        }
    }

    /**
     * 分页查询评论 (后台管理使用)
     */
    @Override
    public Page<CommentAdminDto> getCommentPage(Integer page, Integer size, String status) {
        Page<Comment> commentPage = new Page<>(page, size);
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        // 按状态过滤
        if (status != null && !status.isEmpty()) {
            for (CommentStatus s : CommentStatus.values()) {
                if (s.getCode().equalsIgnoreCase(status)) {
                    wrapper.eq(Comment::getStatus, s);
                    break;
                }
            }
        }
        wrapper.orderByDesc(Comment::getCreatedAt);
        Page<Comment> result = page(commentPage, wrapper);
        
        // 转换为包含文章标题和用户昵称的管理端专用 DTO
        Page<CommentAdminDto> dtoPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        List<CommentAdminDto> dtos = result.getRecords().stream().map(comment -> {
            CommentAdminDto dto = new CommentAdminDto();
            BeanUtils.copyProperties(comment, dto);
            
            // 关联查询文章标题 (方便管理员一眼看出评论属于哪篇文章)
            Article article = articleMapper.selectById(comment.getArticleId());
            if (article != null) {
                dto.setArticleTitle(article.getTitle());
            }
            
            // 填充用户信息
            if (comment.getUserId() != null) {
                User user = userMapper.selectById(comment.getUserId());
                if (user != null) {
                    dto.setUsername(user.getUsername());
                    dto.setUserNickname(user.getNickname());
                }
            }
            return dto;
        }).collect(Collectors.toList());
        
        dtoPage.setRecords(dtos);
        return dtoPage;
    }

    /**
     * 删除评论
     * 权限：仅限评论者本人或管理员删除
     */
    @Override
    @Transactional
    public void deleteComment(Long id, User currentUser) {
        Comment comment = getById(id);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }

        boolean isOwner = currentUser.getId().equals(comment.getUserId());
        boolean isAdmin = "admin".equals(currentUser.getRole());

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Permission denied");
        }

        removeById(id);
        
        // 更新文章评论总数 (-1)
        Article article = articleMapper.selectById(comment.getArticleId());
        if (article != null && article.getCommentCount() > 0) {
            article.setCommentCount(article.getCommentCount() - 1);
            articleMapper.updateById(article);
        }
    }

    /**
     * 审核评论 (通过/拒绝)
     */
    @Override
    public void auditComment(Long id, String status) {
        // 权限硬校验：必须是管理员角色
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User currentUser = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
            if (currentUser != null && "admin".equals(currentUser.getRole())) {
                isAdmin = true;
            }
        }
        
        if (!isAdmin) {
            throw new RuntimeException("No permission to audit comment");
        }

        Comment comment = getById(id);
        if (comment == null) {
            throw new RuntimeException("Comment not found");
        }
        
        try {
            // 动态转换并更新状态
            CommentStatus newStatus = CommentStatus.valueOf(status.toUpperCase());
            comment.setStatus(newStatus);
            updateById(comment);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }

    /**
     * 工具方法：将评论实体转换为包含用户信息的 Response DTO
     */
    private CommentResponse mapToResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        BeanUtils.copyProperties(comment, response);
        
        if (comment.getUserId() != null) {
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                UserDto userDto = new UserDto();
                BeanUtils.copyProperties(user, userDto);
                response.setUser(userDto);
            }
        }
        return response;
    }

    /**
     * 工具方法：从请求头中解析真实的客户端 IP 地址
     * 考虑了反向代理 (Nginx 等) 可能带来的干扰
     */
    private String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
}
