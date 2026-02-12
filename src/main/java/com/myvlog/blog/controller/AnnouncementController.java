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
    public ResponseEntity<List<AnnouncementDto>> getActiveAnnouncements() {
        System.out.println("DEBUG: getActiveAnnouncements called");
        List<Announcement> announcements = announcementService.getActiveAnnouncements();
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
        try {
            System.out.println("DEBUG: createAnnouncement called with: " + announcementDto);
            
            // Check current authentication roles
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("DEBUG: Current User: " + (auth != null ? auth.getName() : "null"));
            System.out.println("DEBUG: Current Authorities: " + (auth != null ? auth.getAuthorities() : "null"));

            Announcement announcement = new Announcement();
            announcement.setTitle(announcementDto.getTitle());
            announcement.setContent(announcementDto.getContent());
            announcement.setType(announcementDto.getType());
            // Explicitly set isActive, default to true if null
            announcement.setIsActive(announcementDto.getIsActive() != null ? announcementDto.getIsActive() : true);
            
            System.out.println("DEBUG: announcement entity prepared: " + announcement);
            announcementService.save(announcement);
            System.out.println("DEBUG: announcement saved successfully with ID: " + announcement.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("ERROR: Failed to create announcement: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.removeById(id);
        return ResponseEntity.ok().build();
    }
}
