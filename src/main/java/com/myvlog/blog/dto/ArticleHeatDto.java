package com.myvlog.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArticleHeatDto {
    private String title;
    private Integer viewCount;
    private Double score;
}
