package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.myvlog.blog.enums.CommentStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("comments")
public class Comment extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long articleId;

    private Long userId;

    private Long parentId;

    private String content;

    private String guestName;

    private String guestEmail;

    private String guestWebsite;

    private CommentStatus status;

    private Boolean isAdminReply;

    private String ipAddress;

    private String userAgent;
}
