package com.myvlog.blog.controller;

import com.myvlog.blog.annotation.Log;
import com.myvlog.blog.annotation.RateLimit;
import com.myvlog.blog.dto.AuthResponse;
import com.myvlog.blog.dto.LoginRequest;
import com.myvlog.blog.dto.RegisterRequest;
import com.myvlog.blog.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Log(module = "Auth", action = "Register", description = "User registration")
    @RateLimit(limit = 5, timeout = 1, unit = TimeUnit.MINUTES)
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Log(module = "Auth", action = "Login", description = "User login")
    @RateLimit(limit = 10, timeout = 1, unit = TimeUnit.MINUTES)
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("DEBUG: Login request received for user: " + request.getUsername());
        return ResponseEntity.ok(authService.login(request));
    }
}
