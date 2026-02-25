package com.myvlog.blog.dto;

import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.enums.ArticleVisibility;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String contentHtml;
    private String summary;
    private String coverImage;
    
    private UserDto author;
    private CategoryDto category;
    private List<TagDto> tags;
    private List<ColumnDto> columns;
    private List<Long> columnIds;

    private ArticleStatus status;
    private ArticleVisibility visibility;
    
    private Boolean locked;
    
    private BigDecimal price;
    private Boolean isTop;
    private Boolean allowComment;
    
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Integer wordCount;
    private Integer readingTime;
    
    private Double score;

    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // TOC Structure (JSON String or List)
    private List<TocItem> toc;
    
    @Data
    public static class TocItem {
        private String text;
        private String id;
        private int level; // 1-6
        private List<TocItem> children;
    }
}
