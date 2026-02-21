package com.myvlog.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.myvlog.blog.dto.ArticleHeatDto;
import com.myvlog.blog.dto.DashboardStats;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.entity.Project;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.service.ArticleService;
import com.myvlog.blog.service.CategoryService;
import com.myvlog.blog.service.ProjectService;
import com.myvlog.blog.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ArticleService articleService;
    private final ProjectService projectService;
    private final UserService userService;
    private final CategoryService categoryService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && (authentication.getPrincipal() instanceof UserDetails)) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            log.info("Authenticated dashboard stats request from user: {}", username);
        } else {
            log.info("Guest dashboard stats request");
        }
        
        DashboardStats.DashboardStatsBuilder builder = DashboardStats.builder();
        
        try {
            long articleCount = articleService.count();
            long projectCount = projectService.count();
            long userCount = userService.count();
            long categoryCount = categoryService.count();
            
            builder.articleCount(articleCount);
            builder.projectCount(projectCount);
            builder.userCount(userCount);
            builder.categoryCount(categoryCount);
            
            List<Article> allArticles = articleService.list(new LambdaQueryWrapper<Article>().select(Article::getViewCount));
            builder.totalViews(allArticles.stream().mapToLong(a -> a.getViewCount() == null ? 0 : a.getViewCount()).sum());
            
            List<DashboardStats.DailyStats> publishFrequency = generateWeeklyPublishStats();
            List<DashboardStats.DailyStats> audienceGrowth = generateWeeklyAudienceStats();
            
            builder.publishFrequency(publishFrequency);
            builder.audienceGrowth(audienceGrowth);
            
        } catch (Exception e) {
            log.error("Error calculating dashboard stats", e);
            builder.articleCount(0L).projectCount(0L).totalViews(0L).userCount(0L).categoryCount(0L);
        }
        
        return ResponseEntity.ok(builder.build());
    }

    private List<DashboardStats.DailyStats> generateWeeklyPublishStats() {
        List<DashboardStats.DailyStats> stats = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
            wrapper.ge(Article::getCreatedAt, startOfDay)
                   .lt(Article::getCreatedAt, endOfDay);
            
            long posts = articleService.count(wrapper);
            
            wrapper = new LambdaQueryWrapper<>();
            wrapper.ge(Article::getCreatedAt, startOfDay)
                   .lt(Article::getCreatedAt, endOfDay);
            List<Article> dayArticles = articleService.list(wrapper);
            long views = dayArticles.stream()
                    .mapToLong(a -> a.getViewCount() == null ? 0 : a.getViewCount())
                    .sum();
            
            stats.add(DashboardStats.DailyStats.builder()
                    .name(dayNames[i])
                    .views(views)
                    .posts(posts)
                    .build());
        }
        
        return stats;
    }

    private List<DashboardStats.DailyStats> generateWeeklyAudienceStats() {
        List<DashboardStats.DailyStats> stats = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        String[] dayNames = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        
        long cumulativeUsers = userService.count();
        
        for (int i = 0; i < 7; i++) {
            LocalDate date = monday.plusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
            wrapper.ge(User::getCreatedAt, startOfDay)
                   .lt(User::getCreatedAt, endOfDay);
            
            long newUsers = userService.count(wrapper);
            
            LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
            articleWrapper.ge(Article::getCreatedAt, startOfDay)
                         .lt(Article::getCreatedAt, endOfDay);
            long posts = articleService.count(articleWrapper);
            
            stats.add(DashboardStats.DailyStats.builder()
                    .name(dayNames[i])
                    .views(newUsers)
                    .posts(posts)
                    .build());
        }
        
        return stats;
    }

    @GetMapping("/heat")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ArticleHeatDto>> getHeatData() {
        Page<Article> page = new Page<>(1, 10);
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.select(Article::getTitle, Article::getViewCount, Article::getScore)
               .orderByDesc(Article::getScore);
        
        List<Article> articles = articleService.page(page, wrapper).getRecords();
        
        List<ArticleHeatDto> heatData = articles.stream()
                .map(a -> new ArticleHeatDto(a.getTitle(), a.getViewCount(), a.getScore()))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(heatData);
    }
}
