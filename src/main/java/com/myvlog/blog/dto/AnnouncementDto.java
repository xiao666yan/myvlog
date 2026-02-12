package com.myvlog.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnnouncementDto {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
