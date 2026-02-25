package com.myvlog.blog.controller;

import com.myvlog.blog.dto.AnnouncementDto;
import com.myvlog.blog.entity.Announcement;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.AnnouncementService;
import com.myvlog.blog.service.UserAnnouncementReadService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserAnnouncementReadService userAnnouncementReadService;
    private final UserService userService;

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAnnouncements() {
        try {
            System.out.println("DEBUG: getActiveAnnouncements called");
            List<Announcement> announcements = announcementService.getActiveAnnouncements();
            if (announcements == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }
            
            User currentUser = tryGetCurrentUser();
            List<Long> readIds = currentUser != null 
                ? userAnnouncementReadService.getReadAnnouncementIds(currentUser.getId())
                : java.util.Collections.emptyList();
            
            List<Map<String, Object>> result = announcements.stream().map(a -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("title", a.getTitle());
                item.put("content", a.getContent());
                item.put("type", a.getType());
                item.put("isActive", a.getIsActive());
                item.put("createdAt", a.getCreatedAt());
                item.put("updatedAt", a.getUpdatedAt());
                item.put("hasRead", readIds.contains(a.getId()));
                return item;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("ERROR in getActiveAnnouncements: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "获取公告失败: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "请先登录"));
            }
            userAnnouncementReadService.markAsRead(currentUser.getId(), id);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            System.err.println("ERROR in markAsRead: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "标记失败: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnnouncementDto>> getAllAnnouncements() {
        List<Announcement> announcements = announcementService.list();
        List<AnnouncementDto> dtos = announcements.stream().map(a -> {
            AnnouncementDto dto = new AnnouncementDto();
            BeanUtils.copyProperties(a, dto);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createAnnouncement(@RequestBody AnnouncementDto announcementDto) {
        Announcement announcement = new Announcement();
        BeanUtils.copyProperties(announcementDto, announcement);
        if (announcement.getIsActive() == null) {
            announcement.setIsActive(true);
        }
        announcementService.save(announcement);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateAnnouncement(@PathVariable Long id, @RequestBody AnnouncementDto announcementDto) {
        Announcement announcement = announcementService.getById(id);
        if (announcement == null) {
            return ResponseEntity.notFound().build();
        }
        BeanUtils.copyProperties(announcementDto, announcement, "id", "createdAt");
        announcementService.updateById(announcement);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.removeById(id);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            return userService.getByUsername(username);
        }
        throw new RuntimeException("未登录");
    }

    private User tryGetCurrentUser() {
        try {
            return getCurrentUser();
        } catch (Exception e) {
            return null;
        }
    }
}
