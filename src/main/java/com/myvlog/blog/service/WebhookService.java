package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.Webhook;

public interface WebhookService extends IService<Webhook> {
    void triggerEvent(String event, Object payload);
}
