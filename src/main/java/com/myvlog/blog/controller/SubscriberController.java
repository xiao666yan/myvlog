package com.myvlog.blog.controller;

import com.myvlog.blog.annotation.RateLimit;
import com.myvlog.blog.service.SubscriberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/subscribe")
@RequiredArgsConstructor
public class SubscriberController {

    private final SubscriberService subscriberService;

    @PostMapping
    @RateLimit(limit = 5, timeout = 1, unit = TimeUnit.HOURS)
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body("Invalid email");
        }
        
        subscriberService.subscribe(email);
        return ResponseEntity.ok("Subscribed successfully");
    }

    @GetMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestParam String email, @RequestParam String token) {
        subscriberService.unsubscribe(email, token);
        return ResponseEntity.ok("Unsubscribed successfully");
    }
}
