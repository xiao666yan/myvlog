package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Subscriber;
import com.myvlog.blog.mapper.SubscriberMapper;
import com.myvlog.blog.service.EmailService;
import com.myvlog.blog.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriberServiceImpl extends ServiceImpl<SubscriberMapper, Subscriber> implements SubscriberService {

    private final EmailService emailService;

    @Override
    public void subscribe(String email) {
        Subscriber subscriber = getOne(new LambdaQueryWrapper<Subscriber>().eq(Subscriber::getEmail, email));
        if (subscriber != null) {
            return; // Already subscribed
        }

        subscriber = new Subscriber();
        subscriber.setEmail(email);
        subscriber.setIsVerified(true); // Simplify: Auto verify for now
        subscriber.setUnsubscribeToken(UUID.randomUUID().toString());
        save(subscriber);
        
        emailService.sendSimpleMessage(email, "Welcome to CodeCanvas", "Thanks for subscribing!");
    }

    @Override
    public void unsubscribe(String email, String token) {
        remove(new LambdaQueryWrapper<Subscriber>()
                .eq(Subscriber::getEmail, email)
                .eq(Subscriber::getUnsubscribeToken, token));
    }

    @Override
    @Async
    public void notifySubscribers(String title, String url) {
        List<Subscriber> subscribers = list();
        for (Subscriber sub : subscribers) {
            String content = "New article published: " + title + "\nRead here: " + url + 
                    "\n\nTo unsubscribe: /api/subscribe/unsubscribe?email=" + sub.getEmail() + "&token=" + sub.getUnsubscribeToken();
            emailService.sendSimpleMessage(sub.getEmail(), "New Article: " + title, content);
        }
    }
}
