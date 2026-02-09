package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.Subscriber;

public interface SubscriberService extends IService<Subscriber> {
    void subscribe(String email);
    void unsubscribe(String email, String token);
    void notifySubscribers(String title, String url);
}
