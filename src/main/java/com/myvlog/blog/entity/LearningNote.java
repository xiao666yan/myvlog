package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("learning_notes")
public class LearningNote extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long articleId;

    private Long userId;

    private String content;
}
