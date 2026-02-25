package com.myvlog.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LearningProgressDto {
    private Long id;
    private Long userId;
    private Long articleId;
    private Integer progress;
    private LocalDateTime lastReadAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long columnId;
}
