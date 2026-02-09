package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.User;

public interface UserService extends IService<User> {
    void grantVip(Long userId, int days);
    
    void updateNickname(Long userId, String nickname);

    void updateEmail(Long userId, String email);
    
    void updateAvatar(Long userId, String avatarUrl);
    
    void updatePassword(Long userId, String oldPassword, String newPassword);

    User getUserById(Long id);
    User getByUsername(String username);
}
