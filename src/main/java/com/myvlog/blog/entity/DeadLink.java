package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * Dead Link Entity
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dead_links")
public class DeadLink extends BaseEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String url;

    private Integer statusCode;

    private String errorMessage;

    /**
     * Source Type: ARTICLE, COMMENT
     */
    private String sourceType;

    private Long sourceId;
}
