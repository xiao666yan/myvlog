package com.myvlog.blog.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ProductType {
    VIP_MONTHLY("vip_monthly", "月度会员"),
    VIP_YEARLY("vip_yearly", "年度会员"),
    VIP_LIFETIME("vip_lifetime", "终身会员"),
    ARTICLE("article", "单篇付费文章");

    @EnumValue
    @JsonValue
    private final String code;
    private final String desc;

    ProductType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
