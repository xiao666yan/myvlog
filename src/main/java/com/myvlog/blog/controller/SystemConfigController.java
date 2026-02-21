package com.myvlog.blog.controller;

import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.SystemConfigService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService systemConfigService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getConfigs() {
        return ResponseEntity.ok(systemConfigService.getAllConfigs());
    }

    // Admin only
    @PostMapping
    public ResponseEntity<Void> updateConfigs(@RequestBody Map<String, String> configs) {
        // Check permission
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = false;
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User currentUser = userService.getOne(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<User>()
                    .eq(User::getUsername, username));
            if (currentUser != null && "admin".equals(currentUser.getRole())) {
                isAdmin = true;
            }
        }
        
        if (!isAdmin) {
            throw new RuntimeException("No permission to update system configs");
        }

        systemConfigService.updateConfigs(configs);
        return ResponseEntity.ok().build();
    }
}
