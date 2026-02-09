package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("friend_links")
public class FriendLink extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String url;

    private String logo;

    private String description;

    private String email;

    // status: active, hidden, pending
    private String status;

    private Integer sortOrder;
}
