package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("webhooks")
public class Webhook extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String event;

    private String targetUrl;

    private String secret;

    private Boolean isActive;
}
