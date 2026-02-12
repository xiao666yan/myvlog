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
        Announcement announcement = new Announcement();
        BeanUtils.copyProperties(announcementDto, announcement);
        announcementService.save(announcement);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.removeById(id);
        return ResponseEntity.ok().build();
    }
}
