package com.myvlog.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.myvlog.blog.dto.AuthResponse;
import com.myvlog.blog.dto.LoginRequest;
import com.myvlog.blog.dto.RegisterRequest;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.exception.BusinessException;
import com.myvlog.blog.utils.JwtUtils;
import com.myvlog.blog.utils.NameUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userMapper.exists(new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()))) {
            throw new BusinessException("Username is already taken");
        }
        // Check if email exists
        if (userMapper.exists(new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail()))) {
            throw new BusinessException("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        // Generate random nickname if not provided
        if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
            user.setNickname(request.getNickname());
        } else {
            user.setNickname(NameUtils.generateRandomName());
        }
        
        user.setRole("user");
        user.setStatus(1); // Active

        userMapper.insert(user);

        String token = jwtUtils.generateToken(user.getUsername());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .bio(user.getBio())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("DEBUG: Attempting authentication for user: " + request.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            System.out.println("DEBUG: Authentication successful for user: " + request.getUsername());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername()));
            String token = jwtUtils.generateToken(user.getUsername());

            return AuthResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .nickname(user.getNickname())
                    .email(user.getEmail())
                    .avatar(user.getAvatar())
                    .role(user.getRole())
                    .bio(user.getBio())
                    .build();
        } catch (Exception e) {
            System.out.println("DEBUG: Authentication failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
