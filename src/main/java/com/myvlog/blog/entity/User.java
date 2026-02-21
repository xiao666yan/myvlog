package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("users")
public class User extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String email;

    private String passwordHash;

    private String nickname;

    private String avatar;

    private String bio;

    // role: user, admin, vip
    private String role;

    // status: 1-normal, 0-disabled
    private Integer status;

    private LocalDateTime vipExpireAt;

    private LocalDateTime lastLoginAt;

    private String lastLoginIp;
    
    // JSON string for user preferences (e.g. dark_mode, email_notifications)
    private String preferences;
}
