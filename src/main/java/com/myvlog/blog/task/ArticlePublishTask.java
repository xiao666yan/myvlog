package com.myvlog.blog.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class ArticlePublishTask {

    private final ArticleService articleService;

    /**
     * Check for scheduled articles every minute
     */
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void publishScheduledArticles() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find articles that are SCHEDULED and publishedAt <= now
        List<Article> scheduledArticles = articleService.list(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, ArticleStatus.SCHEDULED)
                .le(Article::getPublishedAt, now));
        
        if (scheduledArticles.isEmpty()) {
            return;
        }
        
        log.info("Found {} articles to publish.", scheduledArticles.size());
        
        for (Article article : scheduledArticles) {
            try {
                articleService.processScheduledArticle(article);
            } catch (Exception e) {
                log.error("Failed to publish scheduled article: {}", article.getId(), e);
            }
        }
        
        // articleService.updateBatchById(scheduledArticles); // Handled individually in processScheduledArticle
        log.info("Published {} articles.", scheduledArticles.size());
    }
}
