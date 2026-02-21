package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("subscribers")
public class Subscriber extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String email;

    private Boolean isVerified;

    private String unsubscribeToken;
}
