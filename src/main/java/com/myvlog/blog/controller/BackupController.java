package com.myvlog.blog.controller;

import com.myvlog.blog.annotation.Log;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.BackupService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

@RestController
@RequestMapping("/api/admin/backups")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;
    private final UserService userService;

    @GetMapping("/export")
    @Log(module = "Backup", action = "Export", description = "Manual data export")
    public ResponseEntity<Resource> exportData() {
        // Security Check
        checkAdmin();

        File backupFile = backupService.performBackup();
        
        Resource resource = new FileSystemResource(backupFile);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + backupFile.getName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
    
    private void checkAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userService.getByUsername(username);
            if (user != null && "admin".equals(user.getRole())) {
                return;
            }
        }
        throw new RuntimeException("Access denied: Admin only");
    }
}
