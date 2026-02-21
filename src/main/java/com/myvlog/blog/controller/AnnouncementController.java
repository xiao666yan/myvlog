package com.myvlog.blog.controller;

import com.myvlog.blog.dto.AnnouncementDto;
import com.myvlog.blog.entity.Announcement;
import com.myvlog.blog.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/active")
    public ResponseEntity<?> getActiveAnnouncements() {
        try {
            System.out.println("DEBUG: getActiveAnnouncements called");
            List<Announcement> announcements = announcementService.getActiveAnnouncements();
            if (announcements == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }
            List<AnnouncementDto> dtos = announcements.stream().map(a -> {
                AnnouncementDto dto = new AnnouncementDto();
                try {
                    BeanUtils.copyProperties(a, dto);
                } catch (Exception e) {
                    System.err.println("ERROR: BeanUtils copy failed for announcement ID " + a.getId());
                }
                return dto;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("ERROR in getActiveAnnouncements: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", "获取公告失败: " + e.getMessage()));
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
}
