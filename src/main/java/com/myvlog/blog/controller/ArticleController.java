package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.dto.ArticleRequest;
import com.myvlog.blog.dto.ArticleResponse;
import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    // Public: Get List
    @GetMapping
    public ResponseEntity<IPage<ArticleResponse>> getArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(defaultValue = "newest") String sort) { // newest, hottest
        
        Page<com.myvlog.blog.entity.Article> pageParam = new Page<>(page, size);
        // Force status to PUBLISHED for public list
        return ResponseEntity.ok(articleService.getArticleList(pageParam, categoryId, tagId, ArticleStatus.PUBLISHED.name(), sort));
    }

    // Public: Get Detail by ID
    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponse> getArticle(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getArticleById(id));
    }
    
    // Public: Get Detail by Slug
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ArticleResponse> getArticleBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.getArticleBySlug(slug));
    }

    // Auth: Get My Articles
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<java.util.List<ArticleResponse>> getMyArticles() {
        return ResponseEntity.ok(articleService.getMyArticles());
    }

    // Auth: Create
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ArticleResponse> createArticle(@RequestBody @Validated ArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request));
    }

    // Auth: Update
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ArticleResponse> updateArticle(@PathVariable Long id, @RequestBody @Validated ArticleRequest request) {
        return ResponseEntity.ok(articleService.updateArticle(id, request));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> likeArticle(@PathVariable Long id) {
        articleService.likeArticle(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlikeArticle(@PathVariable Long id) {
        articleService.unlikeArticle(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> getLikeStatus(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.hasLiked(id));
    }

    // Auth: Delete
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok().build();
    }

    // Admin: List all articles
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IPage<ArticleResponse>> getAdminArticles(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String status) {
        
        Page<com.myvlog.blog.entity.Article> pageParam = new Page<>(page, size);
        return ResponseEntity.ok(articleService.getArticleList(pageParam, categoryId, tagId, status));
    }

    // Admin: Audit
    @PutMapping("/{id}/audit")
    public ResponseEntity<Void> auditArticle(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        articleService.auditArticle(id, status, reason);
        return ResponseEntity.ok().build();
    }
}
