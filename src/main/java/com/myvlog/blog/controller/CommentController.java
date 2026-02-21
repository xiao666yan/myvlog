package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.dto.CommentAdminDto;
import com.myvlog.blog.dto.CommentRequest;
import com.myvlog.blog.dto.CommentResponse;
import com.myvlog.blog.entity.Comment;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.CommentService;
import com.myvlog.blog.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    // Public: Get comments for an article
    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long articleId) {
        return ResponseEntity.ok(commentService.getCommentsByArticleId(articleId));
    }

    // Public/User: Add comment (Auth optional if guest comments enabled)
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@Valid @RequestBody CommentRequest request, 
                                                      HttpServletRequest httpRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            currentUser = userService.getOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                    .eq(User::getUsername, username));
        }

        return ResponseEntity.ok(commentService.addComment(request, currentUser, httpRequest));
    }

    // Admin: Get all comments (Audit)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CommentAdminDto>> getAdminComments(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(commentService.getCommentPage(page, size, status));
    }

    // User/Admin: Delete comment
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = null;
        
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        
        if (username == null) {
            // Check if it's string (unlikely if authenticated via JWT but possible for anonymous)
            if (authentication != null && authentication.getPrincipal() instanceof String 
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                username = (String) authentication.getPrincipal();
            }
        }
        
        if (username == null) {
            throw new RuntimeException("Unauthorized or User not found");
        }

        User currentUser = userService.getOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
        commentService.deleteComment(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // Admin: Audit comment
    @PutMapping("/{id}/audit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> auditComment(
            @PathVariable Long id, 
            @RequestParam String status) {
        commentService.auditComment(id, status);
        return ResponseEntity.ok().build();
    }
}
