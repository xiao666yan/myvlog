package com.myvlog.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull(message = "Article ID cannot be null")
    private Long articleId;

    private Long parentId;

    @NotBlank(message = "Content cannot be empty")
    private String content;

    // Optional guest info
    private String guestName;
    private String guestEmail;
    private String guestWebsite;
}
