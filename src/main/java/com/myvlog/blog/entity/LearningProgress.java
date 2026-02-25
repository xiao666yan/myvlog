package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("learning_progress")
public class LearningProgress extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long articleId;

    private Integer progress;

    private LocalDateTime lastReadAt;
}
