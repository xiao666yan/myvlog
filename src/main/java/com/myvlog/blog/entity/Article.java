package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.enums.ArticleVisibility;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("articles")
public class Article extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;
    private String slug;
    private String content;
    private String htmlContent;
    private String summary;
    private String coverImage;
    private Long authorId;
    private Long categoryId;
    
    private ArticleStatus status;
    private ArticleVisibility visibility;
    
    private String password;
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
    private LocalDateTime deletedAt;
}
