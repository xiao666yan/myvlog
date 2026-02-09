package com.myvlog.blog.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum PaymentMethod {
    ALIPAY("alipay", "支付宝"),
    WECHAT("wechat", "微信支付"),
    PAYPAL("paypal", "PayPal"),
    BALANCE("balance", "余额支付");

    @EnumValue
    @JsonValue
    private final String code;
    private final String desc;

    PaymentMethod(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}
