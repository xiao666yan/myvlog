package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.dto.UserDto;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        User user = userService.getOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        UserDto dto = new UserDto();
        BeanUtils.copyProperties(user, dto);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        Page<User> userPage = userService.page(new Page<>(page, size));
        
        Page<UserDto> dtoPage = new Page<>(userPage.getCurrent(), userPage.getSize(), userPage.getTotal());
        List<UserDto> dtos = userPage.getRecords().stream().map(user -> {
            UserDto dto = new UserDto();
            BeanUtils.copyProperties(user, dto);
            return dto;
        }).collect(Collectors.toList());
        
        dtoPage.setRecords(dtos);
        return ResponseEntity.ok(dtoPage);
    }

    @PutMapping("/{id}/nickname")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateNickname(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String nickname = payload.get("nickname");
        userService.updateNickname(id, nickname);
        return ResponseEntity.ok("Nickname updated successfully");
    }

    @PutMapping("/{id}/email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateEmail(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        userService.updateEmail(id, email);
        return ResponseEntity.ok("Email updated successfully");
    }

    @PutMapping("/{id}/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updateAvatar(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String avatar = payload.get("avatar");
        userService.updateAvatar(id, avatar);
        return ResponseEntity.ok("Avatar updated successfully");
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        userService.updatePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/{id}/vip")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> grantVip(@PathVariable Long id, @RequestParam int days) {
        userService.grantVip(id, days);
        return ResponseEntity.ok("VIP granted successfully for " + days + " days.");
    }
}
