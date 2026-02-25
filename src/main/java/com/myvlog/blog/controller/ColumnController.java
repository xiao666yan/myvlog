package com.myvlog.blog.controller;

import com.myvlog.blog.dto.ColumnDto;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.ColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @GetMapping
    public ResponseEntity<List<ColumnDto>> getAllColumns() {
        return ResponseEntity.ok(columnService.getAllColumns());
    }

    @GetMapping("/tree")
    public ResponseEntity<List<ColumnDto>> getColumnTree() {
        return ResponseEntity.ok(columnService.getColumnTree());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ColumnDto> getColumn(@PathVariable Long id) {
        return ResponseEntity.ok(columnService.getColumn(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColumnDto> createColumn(@RequestBody ColumnDto columnDto) {
        return ResponseEntity.ok(columnService.createColumn(columnDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColumnDto> updateColumn(@PathVariable Long id, @RequestBody ColumnDto columnDto) {
        return ResponseEntity.ok(columnService.updateColumn(id, columnDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long id) {
        columnService.deleteColumn(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{columnId}/articles/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addArticleToColumn(
            @PathVariable Long columnId,
            @PathVariable Long articleId,
            @RequestParam(required = false) Integer sortOrder) {
        columnService.addArticleToColumn(columnId, articleId, sortOrder);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{columnId}/articles/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeArticleFromColumn(
            @PathVariable Long columnId,
            @PathVariable Long articleId) {
        columnService.removeArticleFromColumn(columnId, articleId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{columnId}/articles")
    public ResponseEntity<List<Long>> getArticleIdsByColumnId(@PathVariable Long columnId) {
        return ResponseEntity.ok(columnService.getArticleIdsByColumnId(columnId));
    }
}
