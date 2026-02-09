package com.myvlog.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long articleCount;
    private Long projectCount;
    private Long totalViews;
    private Long categoryCount;
    private Long userCount;
}
