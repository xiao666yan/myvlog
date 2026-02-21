package com.myvlog.blog.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.ArticleRequest;
import com.myvlog.blog.dto.ArticleResponse;
import com.myvlog.blog.entity.Article;

public interface ArticleService extends IService<Article> {
    
    ArticleResponse createArticle(ArticleRequest request);
    
    ArticleResponse updateArticle(Long id, ArticleRequest request);
    
    ArticleResponse getArticleById(Long id);
    
    ArticleResponse getArticleBySlug(String slug);
    
    IPage<ArticleResponse> getArticleList(Page<Article> page, Long categoryId, Long tagId, String status, String sort);
    
    // Legacy overload for backward compatibility if needed, or update call sites
    default IPage<ArticleResponse> getArticleList(Page<Article> page, Long categoryId, Long tagId, String status) {
        return getArticleList(page, categoryId, tagId, status, "newest");
    }

    void deleteArticle(Long id);

    void publishArticle(Long id);
    
    // Like features
    void likeArticle(Long id);
    void unlikeArticle(Long id);
    boolean hasLiked(Long id);

    // Scheduled Publish
    void processScheduledArticle(Article article);

    // Audit
    void auditArticle(Long id, String status, String reason);

    // Search
    IPage<ArticleResponse> searchArticles(Page<Article> page, String keyword, Long categoryId, Long tagId);

    // Get current user's articles
    java.util.List<ArticleResponse> getMyArticles();
}
