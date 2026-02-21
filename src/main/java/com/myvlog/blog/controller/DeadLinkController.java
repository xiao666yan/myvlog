package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.entity.DeadLink;
import com.myvlog.blog.service.DeadLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dead-links")
@RequiredArgsConstructor
public class DeadLinkController {

    private final DeadLinkService deadLinkService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IPage<DeadLink>> getDeadLinks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        return ResponseEntity.ok(deadLinkService.page(new Page<>(page, size)));
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> triggerScan() {
        deadLinkService.scanDeadLinks();
        return ResponseEntity.ok("Dead link scan started in background.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDeadLink(@PathVariable Long id) {
        deadLinkService.removeById(id);
        return ResponseEntity.ok().build();
    }
}
