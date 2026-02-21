package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.*;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.entity.ArticleLike;
import com.myvlog.blog.entity.Category;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.enums.ArticleVisibility;
import com.myvlog.blog.mapper.ArticleLikeMapper;
import com.myvlog.blog.mapper.ArticleMapper;
import com.myvlog.blog.mapper.ArticleTagMapper;
import com.myvlog.blog.mapper.CategoryMapper;
import com.myvlog.blog.mapper.TagMapper;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.service.ArticleService;
import com.myvlog.blog.utils.JwtUtils;
import com.myvlog.blog.utils.MarkdownUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.myvlog.blog.entity.ArticleTag;
import com.myvlog.blog.entity.Tag;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class ArticleServiceImpl extends ServiceImpl<ArticleMapper, Article> implements ArticleService {

    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final ArticleMapper articleMapper;
    private final ArticleLikeMapper articleLikeMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;
    private final com.myvlog.blog.service.SubscriberService subscriberService;
    private final com.myvlog.blog.service.WebhookService webhookService;
    
    // Helper to get current user ID
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        }
        throw new RuntimeException("User not found or not logged in");
    }
    
    // Helper to get current user if logged in, otherwise null
    private User tryGetCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String username = ((UserDetails) authentication.getPrincipal()).getUsername();
                return userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
            }
        } catch (Exception e) {
            // Ignore
        }
        return null;
    }

    @Override
    public IPage<ArticleResponse> searchArticles(Page<Article> page, String keyword, Long categoryId, Long tagId) {
        User currentUser = tryGetCurrentUser();
        log.info("Search Request: keyword='{}', user='{}'", keyword, currentUser != null ? currentUser.getUsername() : "Guest");
        
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        
        // 1. Status & Visibility Filter
        // - Public: see Published && (Visibility != PRIVATE)
        // - Author: see all their own (Drafts, Private included)
        // - Admin: see all
        boolean isStrictTagSearch = StringUtils.hasText(keyword) && keyword.trim().startsWith("#");
        
        if (!isStrictTagSearch) {
            wrapper.and(w -> {
                // Base condition: Published and NOT Private
                w.and(b -> b.eq(Article::getStatus, ArticleStatus.PUBLISHED)
                           .ne(Article::getVisibility, ArticleVisibility.PRIVATE));
                
                if (currentUser != null) {
                    if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                        // Admin sees everything
                        w.or().eq(Article::getStatus, ArticleStatus.DRAFT)
                         .or().eq(Article::getVisibility, ArticleVisibility.PRIVATE);
                    } else {
                        Long uid = currentUser.getId();
                        // Author sees their own Drafts or Private articles
                        w.or(o -> o.and(a -> a.eq(Article::getAuthorId, uid)
                                             .and(i -> i.eq(Article::getStatus, ArticleStatus.DRAFT)
                                                        .or().eq(Article::getVisibility, ArticleVisibility.PRIVATE))));
                    }
                }
            });
        }

        // 2. Keyword Search
        if (StringUtils.hasText(keyword)) {
            String finalKeyword = keyword.trim();
            log.info("Search Processing: finalKeyword='{}'", finalKeyword);
            
            if (finalKeyword.startsWith("#")) {
                // Strict Tag Search: e.g. "#Java"
                String tagName = finalKeyword.substring(1).trim();
                if (StringUtils.hasText(tagName)) {
                    Tag tag = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getName, tagName));
                    if (tag != null) {
                        log.info("Strict Tag Search: Found tag '{}' (id={})", tag.getName(), tag.getId());
                        wrapper.inSql(Article::getId, "SELECT article_id FROM article_tags WHERE tag_id = " + tag.getId());
                    } else {
                        log.info("Strict Tag Search: Tag '{}' not found", tagName);
                        return new Page<>();
                    }
                }
            } else {
                // Pre-fetch matching tags
                List<Tag> matchingTags = tagMapper.selectList(new LambdaQueryWrapper<Tag>().like(Tag::getName, finalKeyword));
                List<Long> tagIds = matchingTags.stream().map(Tag::getId).collect(Collectors.toList());
                log.info("Fuzzy Tag Search: Found {} matching tags: {}", matchingTags.size(), tagIds);

                wrapper.and(w -> {
                    w.like(Article::getTitle, finalKeyword)
                     .or().like(Article::getSummary, finalKeyword)
                     .or().like(Article::getContent, finalKeyword);
                    
                    if (!tagIds.isEmpty()) {
                        String tagIdsStr = tagIds.stream().map(String::valueOf).collect(Collectors.joining(","));
                        w.or().inSql(Article::getId, "SELECT article_id FROM article_tags WHERE tag_id IN (" + tagIdsStr + ")");
                    }
                });
            }
        }

        // 3. Category Filter
        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }

        // 4. Tag Filter (from dropdown)
        if (tagId != null) {
            wrapper.inSql(Article::getId, "SELECT article_id FROM article_tags WHERE tag_id = " + tagId);
        }

        wrapper.orderByDesc(Article::getIsTop);
        wrapper.orderByDesc(Article::getPublishedAt);
        wrapper.orderByDesc(Article::getCreatedAt);

        Page<Article> articlePage = page(page, wrapper);
        
        return articlePage.convert(article -> {
            ArticleResponse response = mapToResponse(article, currentUser);
            if (StringUtils.hasText(keyword) && !keyword.trim().startsWith("#")) {
                response.setTitle(highlight(response.getTitle(), keyword));
                response.setSummary(highlight(response.getSummary(), keyword));
            }
            return response;
        });
    }

    @Override
    public List<ArticleResponse> getMyArticles() {
        User currentUser = getCurrentUser();
        
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getAuthorId, currentUser.getId())
                .orderByDesc(Article::getPublishedAt)
                .orderByDesc(Article::getCreatedAt)); // Fallback to created_at if not published
                
        return articles.stream()
                .map(article -> mapToResponse(article, currentUser))
                .collect(Collectors.toList());
    }

    private String highlight(String text, String keyword) {
        if (!StringUtils.hasText(text) || !StringUtils.hasText(keyword)) {
            return text;
        }
        // Simple case-insensitive replacement
        // Note: For production, use regex with Pattern.CASE_INSENSITIVE
        return text.replaceAll("(?i)" + java.util.regex.Pattern.quote(keyword), "<mark>$0</mark>");
    }

    @Override
    @Transactional
    public ArticleResponse createArticle(ArticleRequest request) {
        User currentUser = getCurrentUser();
        
        Article article = new Article();
        BeanUtils.copyProperties(request, article);
        
        // Handle Slug
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug(generateSlug(article.getTitle()));
        }
        
        // Ensure slug uniqueness
        article.setSlug(ensureUniqueSlug(article.getSlug(), null));
        
        // Handle Author
        article.setAuthorId(currentUser.getId());
        
        // Handle auto fields
        article.setWordCount(countWords(article.getContent()));
        article.setReadingTime(calculateReadingTime(article.getWordCount()));
        
        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        save(article);
        
        if (article.getStatus() == ArticleStatus.PUBLISHED) {
            triggerNotifications(article);
        }
        
        // Handle Tags
        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            for (Long tagId : request.getTagIds()) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(article.getId());
                articleTag.setTagId(tagId);
                articleTagMapper.insert(articleTag);
            }
        }
        
        return mapToResponse(article, currentUser);
    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(Long id, ArticleRequest request) {
        Article article = getById(id);
        if (article == null) {
            throw new RuntimeException("Article not found");
        }
        
        User currentUser = getCurrentUser();
        if (!article.getAuthorId().equals(currentUser.getId()) && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("No permission to edit this article");
        }
        
        String oldSlug = article.getSlug();
        BeanUtils.copyProperties(request, article, "id", "authorId", "viewCount", "likeCount", "commentCount", "createdAt");
        
        // Handle Slug change
        if (!StringUtils.hasText(article.getSlug())) {
            article.setSlug(generateSlug(article.getTitle()));
        }
        
        // Ensure slug uniqueness (excluding current article)
        article.setSlug(ensureUniqueSlug(article.getSlug(), id));
        
        article.setWordCount(countWords(article.getContent()));
        article.setReadingTime(calculateReadingTime(article.getWordCount()));
        
        if (request.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        updateById(article);

        // Handle Tags Update
        if (request.getTagIds() != null) {
            // Delete existing
            articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                    .eq(ArticleTag::getArticleId, article.getId()));
            
            // Insert new
            for (Long tagId : request.getTagIds()) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(article.getId());
                articleTag.setTagId(tagId);
                articleTagMapper.insert(articleTag);
            }
        }
        
        return mapToResponse(article, currentUser);
    }

    @Override
    public ArticleResponse getArticleById(Long id) {
        Article article = getById(id);
        if (article == null) throw new RuntimeException("Article not found");
        
        User currentUser = tryGetCurrentUser();
        
        // Draft & Visibility check: only author or admin can see drafts or private articles
        if (article.getStatus() != ArticleStatus.PUBLISHED || article.getVisibility() == ArticleVisibility.PRIVATE) {
            if (currentUser == null) {
                throw new RuntimeException(article.getVisibility() == ArticleVisibility.PRIVATE ? "Article is private" : "Article not published");
            }
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isAuthor = article.getAuthorId().equals(currentUser.getId());
            if (!isAdmin && !isAuthor) {
                throw new RuntimeException(article.getVisibility() == ArticleVisibility.PRIVATE ? "Article is private" : "Article not published");
            }
        }
        
        // Atomic increment view count
        articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                .eq(Article::getId, id)
                .setSql("view_count = view_count + 1"));
        
        // Reload to get updated count (optional, or just manually increment local object)
        article.setViewCount(article.getViewCount() + 1);
        
        return mapToResponse(article, currentUser);
    }
    
    @Override
    public ArticleResponse getArticleBySlug(String slug) {
        Article article = getOne(new LambdaQueryWrapper<Article>().eq(Article::getSlug, slug));
        if (article == null) throw new RuntimeException("Article not found");
        
        User currentUser = tryGetCurrentUser();

        // Draft & Visibility check: only author or admin can see drafts or private articles
        if (article.getStatus() != ArticleStatus.PUBLISHED || article.getVisibility() == ArticleVisibility.PRIVATE) {
            if (currentUser == null) {
                throw new RuntimeException(article.getVisibility() == ArticleVisibility.PRIVATE ? "Article is private" : "Article not published");
            }
            boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
            boolean isAuthor = article.getAuthorId().equals(currentUser.getId());
            if (!isAdmin && !isAuthor) {
                throw new RuntimeException(article.getVisibility() == ArticleVisibility.PRIVATE ? "Article is private" : "Article not published");
            }
        }
        
        // Atomic increment view count
        articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                .eq(Article::getId, article.getId())
                .setSql("view_count = view_count + 1"));

        article.setViewCount(article.getViewCount() + 1);
        
        return mapToResponse(article, currentUser);
    }

    @Override
    public IPage<ArticleResponse> getArticleList(Page<Article> page, Long categoryId, Long tagId, String status, String sort) {
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        User currentUser = tryGetCurrentUser();

        // 1. Status & Visibility Filter
        // - Public: see Published && (Visibility != PRIVATE)
        // - Author: see all their own (Drafts, Private included)
        // - Admin: see all
        wrapper.and(w -> {
            // Base condition: Published and NOT Private
            w.and(b -> b.eq(Article::getStatus, ArticleStatus.PUBLISHED)
                       .ne(Article::getVisibility, ArticleVisibility.PRIVATE));
            
            if (currentUser != null) {
                if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                    // Admin sees everything
                    w.or().eq(Article::getStatus, ArticleStatus.DRAFT)
                     .or().eq(Article::getVisibility, ArticleVisibility.PRIVATE);
                } else {
                    Long uid = currentUser.getId();
                    // Author sees their own Drafts or Private articles
                    w.or(o -> o.and(a -> a.eq(Article::getAuthorId, uid)
                                         .and(i -> i.eq(Article::getStatus, ArticleStatus.DRAFT)
                                                    .or().eq(Article::getVisibility, ArticleVisibility.PRIVATE))));
                }
            }
        });
        
        if (StringUtils.hasText(status)) {
            wrapper.eq(Article::getStatus, ArticleStatus.valueOf(status.toUpperCase()));
        }
        
        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }
        
        if (tagId != null) {
            wrapper.inSql(Article::getId, "SELECT article_id FROM article_tags WHERE tag_id = " + tagId);
        }
        
        // Sorting logic
        wrapper.orderByDesc(Article::getIsTop); // Top articles always first
        
        if ("hottest".equalsIgnoreCase(sort) || "hot".equalsIgnoreCase(sort)) {
            wrapper.orderByDesc(Article::getScore);
            wrapper.orderByDesc(Article::getPublishedAt);
        } else {
            // Default newest
            wrapper.orderByDesc(Article::getPublishedAt);
            wrapper.orderByDesc(Article::getCreatedAt);
        }
        
        Page<Article> articlePage = page(page, wrapper);
        
        return articlePage.convert(article -> mapToResponse(article, currentUser));
    }

    @Override
    public void deleteArticle(Long id) {
        Article article = getById(id);
        if (article == null) return;
        
        User currentUser = getCurrentUser();
        if (!article.getAuthorId().equals(currentUser.getId()) && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("No permission to delete this article");
        }
        
        // Soft delete (if configured in MP) or logical delete
        removeById(id); 
    }

    @Override
    public void publishArticle(Long id) {
        Article article = getById(id);
        if (article != null) {
             User currentUser = getCurrentUser();
            if (!article.getAuthorId().equals(currentUser.getId()) && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                throw new RuntimeException("No permission");
            }
            article.setStatus(ArticleStatus.PUBLISHED);
            article.setPublishedAt(LocalDateTime.now());
            updateById(article);
            triggerNotifications(article);
        }
    }
    
    @Override
    @Transactional
    public void likeArticle(Long id) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        
        // Check if already liked
        Long count = articleLikeMapper.selectCount(new LambdaQueryWrapper<ArticleLike>()
                .eq(ArticleLike::getArticleId, id)
                .eq(ArticleLike::getUserId, userId));
                
        if (count > 0) {
            return; // Already liked
        }
        
        // Insert like record
        ArticleLike like = new ArticleLike();
        like.setArticleId(id);
        like.setUserId(userId);
        articleLikeMapper.insert(like);
        
        // Increment article like count
        articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                .eq(Article::getId, id)
                .setSql("like_count = like_count + 1"));
    }

    @Override
    @Transactional
    public void unlikeArticle(Long id) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        
        // Delete like record
        int rows = articleLikeMapper.delete(new LambdaQueryWrapper<ArticleLike>()
                .eq(ArticleLike::getArticleId, id)
                .eq(ArticleLike::getUserId, userId));
                
        if (rows > 0) {
            // Decrement article like count
            articleMapper.update(null, new LambdaUpdateWrapper<Article>()
                    .eq(Article::getId, id)
                    .setSql("like_count = like_count - 1"));
        }
    }

    @Override
    public boolean hasLiked(Long id) {
        try {
            User currentUser = getCurrentUser();
            Long count = articleLikeMapper.selectCount(new LambdaQueryWrapper<ArticleLike>()
                    .eq(ArticleLike::getArticleId, id)
                    .eq(ArticleLike::getUserId, currentUser.getId()));
            return count > 0;
        } catch (Exception e) {
            // If not logged in, return false
            return false;
        }
    }

    @Override
    @Transactional
    public void processScheduledArticle(Article article) {
        article.setStatus(ArticleStatus.PUBLISHED);
        updateById(article);
        triggerNotifications(article);
    }

    @Override
    @Transactional
    public void auditArticle(Long id, String status, String reason) {
        Article article = getById(id);
        if (article == null) {
            throw new RuntimeException("Article not found");
        }

        User currentUser = getCurrentUser();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new RuntimeException("No permission to audit article");
        }

        try {
            ArticleStatus newStatus = ArticleStatus.valueOf(status.toUpperCase());
            article.setStatus(newStatus);
            
            if (newStatus == ArticleStatus.PUBLISHED && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
            
            updateById(article);
            
            if (newStatus == ArticleStatus.PUBLISHED) {
                triggerNotifications(article);
            }
            
            // TODO: If rejected, maybe send notification with reason
            
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status);
        }
    }
    
    // Helpers
    
    private String generateSlug(String title) {
        if (title == null) return java.util.UUID.randomUUID().toString().substring(0, 8);
        // Replace spaces with hyphens, lowercase
        String slug = title.toLowerCase().trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^\\u4e00-\\u9fa5a-z0-9-]", ""); // Keep Chinese, lowercase, digits, hyphens
        
        if (!StringUtils.hasText(slug) || slug.equals("-")) {
            return java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        return slug;
    }

    private String ensureUniqueSlug(String slug, Long excludeId) {
        String originalSlug = slug;
        int count = 1;
        while (count < 10) {
            LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
                    .eq(Article::getSlug, slug);
            if (excludeId != null) {
                wrapper.ne(Article::getId, excludeId);
            }
            
            Article existing = getOne(wrapper);
            if (existing == null) {
                return slug;
            }
            // Append random suffix if duplicate found
            slug = originalSlug + "-" + java.util.UUID.randomUUID().toString().substring(0, 4);
            count++;
        }
        return slug + "-" + System.currentTimeMillis();
    }
    
    private Integer countWords(String content) {
        if (!StringUtils.hasText(content)) return 0;
        
        int count = 0;
        // Regex to match Chinese characters or English words (including numbers)
        // Chinese: [\u4e00-\u9fa5]
        // English/Number: [a-zA-Z0-9]+
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("([\\u4e00-\\u9fa5])|([a-zA-Z0-9]+)");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            count++;
        }
        return count;
    }
    
    private Integer calculateReadingTime(Integer wordCount) {
        if (wordCount == null || wordCount == 0) return 0;
        // Standard reading speed:
        // Chinese: ~400-500 chars/min
        // English: ~200-250 words/min
        // Using an average of ~350 for mixed content
        int wordsPerMinute = 350;
        return Math.max(1, (int) Math.ceil((double) wordCount / wordsPerMinute));
    }
    
    private void triggerNotifications(Article article) {
        if (article.getStatus() != ArticleStatus.PUBLISHED) return;
        
        // Notify Subscribers
        // Assuming frontend is at localhost:3000 or configured domain
        String url = "/articles/" + article.getSlug(); 
        try {
            subscriberService.notifySubscribers(article.getTitle(), url);
        } catch (Exception e) {
            // Ignore notification errors
        }
        
        // Trigger Webhooks
        try {
            webhookService.triggerEvent("article_published", article);
        } catch (Exception e) {
            // Ignore webhook errors
        }
    }

    private ArticleResponse mapToResponse(Article article, User currentUser) {
        ArticleResponse response = new ArticleResponse();
        BeanUtils.copyProperties(article, response);
        
        // Visibility Check
        boolean isLocked = false;
        if (article.getVisibility() == ArticleVisibility.VIP) {
             if (currentUser == null) {
                 isLocked = true;
             } else {
                 boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
                 boolean isAuthor = article.getAuthorId().equals(currentUser.getId());
                 boolean isVip = "VIP".equalsIgnoreCase(currentUser.getRole()) && 
                                 (currentUser.getVipExpireAt() != null && currentUser.getVipExpireAt().isAfter(LocalDateTime.now()));
                 
                 if (!isAdmin && !isAuthor && !isVip) {
                     isLocked = true;
                 }
             }
        }
        
        response.setLocked(isLocked);
        
        if (isLocked) {
            response.setContent("This content is for VIP members only.");
            response.setContentHtml("<div class=\"vip-lock\">This content is for VIP members only.</div>");
            // Keep summary/title/cover/tags/category public
        } else {
            // Render Markdown to HTML
            response.setContentHtml(MarkdownUtils.renderHtml(article.getContent()));
            // Generate TOC
            response.setToc(MarkdownUtils.extractToc(article.getContent()));
        }
        
        // Fill Author info
        User author = userMapper.selectById(article.getAuthorId());
        if (author != null) {
            UserDto userDto = new UserDto();
            BeanUtils.copyProperties(author, userDto);
            response.setAuthor(userDto);
        }
        
        // Fill Category info
        if (article.getCategoryId() != null) {
            Category category = categoryMapper.selectById(article.getCategoryId());
            if (category != null) {
                CategoryDto catDto = new CategoryDto();
                BeanUtils.copyProperties(category, catDto);
                response.setCategory(catDto);
            }
        }
        
        // Fill Tags
        List<ArticleTag> articleTags = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getArticleId, article.getId()));
        if (!articleTags.isEmpty()) {
            List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).collect(Collectors.toList());
            List<Tag> tags = tagMapper.selectBatchIds(tagIds);
            List<TagDto> tagDtos = tags.stream().map(tag -> {
                TagDto dto = new TagDto();
                BeanUtils.copyProperties(tag, dto);
                return dto;
            }).collect(Collectors.toList());
            response.setTags(tagDtos);
        }
        
        return response;
    }
    
    // Overload for internal use without user check needed (e.g. creation)
    private ArticleResponse mapToResponse(Article article) {
        return mapToResponse(article, tryGetCurrentUser());
    }
}
