package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void grantVip(Long userId, int days) {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        user.setRole("vip");
        
        // If already VIP and not expired, extend. Else start from now.
        LocalDateTime now = LocalDateTime.now();
        if (user.getVipExpireAt() != null && user.getVipExpireAt().isAfter(now)) {
            user.setVipExpireAt(user.getVipExpireAt().plusDays(days));
        } else {
            user.setVipExpireAt(now.plusDays(days));
        }
        
        updateById(user);
    }

    @Override
    @Transactional
    public void updateNickname(Long userId, String nickname) {
        if (nickname == null || nickname.trim().isEmpty()) {
            throw new RuntimeException("Nickname cannot be empty");
        }
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setNickname(nickname);
        updateById(user);
    }

    @Override
    @Transactional
    public void updateEmail(Long userId, String email) {
        if (email == null || !email.contains("@")) {
            throw new RuntimeException("Invalid email format");
        }
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        // Check if email is taken by another user
        Long count = lambdaQuery()
                .eq(User::getEmail, email)
                .ne(User::getId, userId)
                .count();
        if (count > 0) {
            throw new RuntimeException("Email already in use");
        }
        
        user.setEmail(email);
        updateById(user);
    }

    @Override
    @Transactional
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setAvatar(avatarUrl);
        updateById(user);
    }

    @Override
    @Transactional
    public void updatePassword(Long userId, String oldPassword, String newPassword) {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Old password does not match");
        }
        
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        updateById(user);
    }

    @Override
    public User getUserById(Long id) {
        return getById(id);
    }

    @Override
    public User getByUsername(String username) {
        return lambdaQuery().eq(User::getUsername, username).one();
    }
}
