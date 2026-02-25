package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("article_columns")
public class ArticleColumn {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long articleId;

    private Long columnId;

    private Integer sortOrder;

    private LocalDateTime createdAt;
}
