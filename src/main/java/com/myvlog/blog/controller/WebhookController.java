package com.myvlog.blog.controller;

import com.myvlog.blog.entity.User;
import com.myvlog.blog.entity.Webhook;
import com.myvlog.blog.service.UserService;
import com.myvlog.blog.service.WebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookService webhookService;
    private final UserService userService;

    private void checkAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userService.getByUsername(username);
            if (user != null && "admin".equals(user.getRole())) {
                return;
            }
        }
        throw new RuntimeException("Access denied: Admin only");
    }

    @GetMapping
    public ResponseEntity<List<Webhook>> list() {
        checkAdmin();
        return ResponseEntity.ok(webhookService.list());
    }

    @PostMapping
    public ResponseEntity<Webhook> create(@RequestBody Webhook webhook) {
        checkAdmin();
        webhookService.save(webhook);
        return ResponseEntity.ok(webhook);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        checkAdmin();
        webhookService.removeById(id);
        return ResponseEntity.ok().build();
    }
}
