package com.myvlog.blog.controller;

import com.myvlog.blog.dto.LearningNoteDto;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.LearningNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class LearningNoteController {

    private final LearningNoteService learningNoteService;

    @GetMapping("/article/{articleId}")
    public ResponseEntity<List<LearningNoteDto>> getNotesByArticleId(@PathVariable Long articleId) {
        return ResponseEntity.ok(learningNoteService.getNotesByArticleId(articleId));
    }

    @PostMapping("/article/{articleId}")
    public ResponseEntity<LearningNoteDto> createNote(
            @PathVariable Long articleId,
            @RequestBody LearningNoteDto noteDto,
            @AuthenticationPrincipal User user) {
        noteDto.setArticleId(articleId);
        return ResponseEntity.ok(learningNoteService.createNote(noteDto, user != null ? user.getId() : null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        learningNoteService.deleteNote(id, user != null ? user.getId() : null);
        return ResponseEntity.ok().build();
    }
}
