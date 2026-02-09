package com.myvlog.blog.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum CommentStatus {
    PENDING("pending", "待审核"),
    APPROVED("approved", "已通过"),
    REJECTED("rejected", "已拒绝"),
    SPAM("spam", "垃圾评论");

    @EnumValue
    @JsonValue
    private final String code;
    private final String desc;

    CommentStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
