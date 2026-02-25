package com.myvlog.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ColumnDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String coverImage;
    private Long parentId;
    private Integer sortOrder;
    private Integer status;
    private Integer progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ColumnDto> children;
    private Long articleCount;
}
