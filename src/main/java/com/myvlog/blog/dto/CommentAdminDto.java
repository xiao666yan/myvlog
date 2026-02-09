package com.myvlog.blog.dto;

import com.myvlog.blog.enums.CommentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentAdminDto {
    private Long id;
    private Long articleId;
    private String articleTitle;
    private Long userId;
    private String username;
    private String userNickname;
    private String content;
    private String guestName;
    private String guestEmail;
    private CommentStatus status;
    private Boolean isAdminReply;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
