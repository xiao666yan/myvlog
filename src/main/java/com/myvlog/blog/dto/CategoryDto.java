package com.myvlog.blog.dto;

import lombok.Data;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
}
