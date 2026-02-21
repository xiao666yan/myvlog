package com.myvlog.blog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

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
    private List<DailyStats> publishFrequency;
    private List<DailyStats> audienceGrowth;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyStats {
        private String name;
        private long views;
        private long posts;
    }
}
