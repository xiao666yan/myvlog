package com.myvlog.blog.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ArticleVisibility {
    PUBLIC("public", "公开"),
    PRIVATE("private", "仅自己可见"),
    VIP("vip", "会员可见"),
    PAID("paid", "付费可见"),
    PASSWORD("password", "密码保护");

    @EnumValue
    @JsonValue
    private final String code;
    private final String desc;

    ArticleVisibility(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
