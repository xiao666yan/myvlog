package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.CommentAdminDto;
import com.myvlog.blog.dto.CommentRequest;
import com.myvlog.blog.dto.CommentResponse;
import com.myvlog.blog.entity.Comment;
import com.myvlog.blog.entity.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface CommentService extends IService<Comment> {
    /**
     * Add a comment
     */
    CommentResponse addComment(CommentRequest request, User currentUser, HttpServletRequest httpRequest);

    /**
     * Get comments by article ID (Tree structure)
     */
    List<CommentResponse> getCommentsByArticleId(Long articleId);
    
    /**
     * Get comment page (Flat structure for admin)
     */
    Page<CommentAdminDto> getCommentPage(Integer page, Integer size, String status);

    /**
     * Delete comment
     */
    void deleteComment(Long id, User currentUser);

    /**
     * Audit comment
     */
    void auditComment(Long id, String status);
}
