package com.myvlog.blog.dto;

import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.enums.ArticleVisibility;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ArticleRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String slug;

    @NotBlank(message = "Content is required")
    private String content;

    private String summary;
    
    private String coverImage;

    private Long categoryId;
    
    private List<Long> tagIds;

    private ArticleStatus status = ArticleStatus.DRAFT;

    private ArticleVisibility visibility = ArticleVisibility.PUBLIC;

    private String password;

    private BigDecimal price;

    private Boolean isTop = false;

    private Boolean allowComment = true;
}
