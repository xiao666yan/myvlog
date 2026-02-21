package com.myvlog.blog.dto;

import com.myvlog.blog.enums.CommentStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private Long articleId;
    private Long parentId;
    private String content;
    
    // User info (if logged in)
    private UserDto user;
    
    // Guest info (if guest)
    private String guestName;
    private String guestWebsite;
    
    private CommentStatus status;
    private Boolean isAdminReply;
    private LocalDateTime createdAt;
    
    // Nested replies
    private List<CommentResponse> replies = new ArrayList<>();
}
