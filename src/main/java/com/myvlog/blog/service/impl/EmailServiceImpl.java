package com.myvlog.blog.service.impl;

import com.myvlog.blog.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        // TODO: Integrate with JavaMailSender
        log.info("Sending email to: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", text);
    }
}
