package com.myvlog.blog.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ArticleStatus {
    DRAFT("draft", "草稿"),
    PUBLISHED("published", "已发布"),
    SCHEDULED("scheduled", "定时发布"),
    HIDDEN("hidden", "隐藏"),
    PENDING("pending", "待审核"),
    REJECTED("rejected", "已拒绝");

    @EnumValue
    @JsonValue
    private final String code;
    private final String desc;

    ArticleStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
