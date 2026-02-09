package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.dto.ArticleHeatDto;
import com.myvlog.blog.dto.DashboardStats;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.entity.Project;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.ArticleService;
import com.myvlog.blog.service.CategoryService;
import com.myvlog.blog.service.ProjectService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 仪表盘控制器
 * 提供后台管理界面的统计数据和分析图表接口
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ArticleService articleService;
    private final ProjectService projectService;
    private final UserService userService;
    private final CategoryService categoryService;

    /**
     * 获取仪表盘核心统计数据
     * 包括：文章数、项目数、总浏览量、用户数、分类数
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        // 1. 获取当前登录用户的认证信息 (可选，用于日志记录)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && (authentication.getPrincipal() instanceof UserDetails)) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            log.info("Authenticated dashboard stats request from user: {}", username);
        } else {
            log.info("Guest dashboard stats request");
        }
        
        DashboardStats.DashboardStatsBuilder builder = DashboardStats.builder();
        
        try {
            // 2. 获取全站全局统计数据 (对所有访客公开)
            long articleCount = articleService.count(); // 文章总数
            long projectCount = projectService.count(); // 项目总数
            long userCount = userService.count();       // 注册用户总数
            long categoryCount = categoryService.count(); // 文章分类总数
            
            builder.articleCount(articleCount);
            builder.projectCount(projectCount);
            builder.userCount(userCount);
            builder.categoryCount(categoryCount);
            
            // 3. 计算全站总浏览量
            List<Article> allArticles = articleService.list(new LambdaQueryWrapper<Article>().select(Article::getViewCount));
            builder.totalViews(allArticles.stream().mapToLong(a -> a.getViewCount() == null ? 0 : a.getViewCount()).sum());
            
        } catch (Exception e) {
            log.error("Error calculating dashboard stats", e);
            builder.articleCount(0L).projectCount(0L).totalViews(0L).userCount(0L).categoryCount(0L);
        }
        
        return ResponseEntity.ok(builder.build());
    }

    /**
     * 获取文章热度排行数据 (Top 10)
     * 仅限管理员访问
     */
    @GetMapping("/heat")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ArticleHeatDto>> getHeatData() {
        // 1. 使用 MyBatis-Plus 的 Page 分页功能获取前 10 条数据
        Page<Article> page = new Page<>(1, 10);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        // 2. 仅查询需要的字段，并按综合热度分数 (score) 倒序排列
        wrapper.select(Article::getTitle, Article::getViewCount, Article::getScore)
               .orderByDesc(Article::getScore);
        
        List<Article> articles = articleService.page(page, wrapper).getRecords();
        
        // 3. 将实体对象转换为精简的 DTO 传输对象
        List<ArticleHeatDto> heatData = articles.stream()
                .map(a -> new ArticleHeatDto(a.getTitle(), a.getViewCount(), a.getScore()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(heatData);
    }
}
