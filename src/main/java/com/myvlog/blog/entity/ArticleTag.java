package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("article_tags")
public class ArticleTag implements java.io.Serializable {
    // Composite primary key (article_id, tag_id), no single ID column
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long articleId;
    private Long tagId;
}
