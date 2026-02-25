package com.myvlog.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LearningNoteDto {
    private Long id;
    private Long articleId;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
