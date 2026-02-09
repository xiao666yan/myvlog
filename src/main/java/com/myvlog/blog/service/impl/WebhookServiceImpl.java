package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Webhook;
import com.myvlog.blog.mapper.WebhookMapper;
import com.myvlog.blog.service.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl extends ServiceImpl<WebhookMapper, Webhook> implements WebhookService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Async
    public void triggerEvent(String event, Object payload) {
        List<Webhook> webhooks = list(new LambdaQueryWrapper<Webhook>()
                .eq(Webhook::getEvent, event)
                .eq(Webhook::getIsActive, true));
                
        for (Webhook webhook : webhooks) {
            try {
                // In production, add signature header using secret
                restTemplate.postForObject(webhook.getTargetUrl(), payload, String.class);
                log.info("Webhook triggered: {} -> {}", event, webhook.getTargetUrl());
            } catch (Exception e) {
                log.error("Webhook failed: {} -> {}", event, webhook.getTargetUrl(), e);
            }
        }
    }
}
