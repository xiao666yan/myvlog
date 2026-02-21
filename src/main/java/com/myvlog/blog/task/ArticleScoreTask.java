package com.myvlog.blog.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.enums.ArticleStatus;
import com.myvlog.blog.service.ArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ArticleScoreTask {

    private final ArticleService articleService;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void calculateArticleScores() {
        log.info("Starting article score calculation...");
        
        // Fetch all published articles
        // In production with large data, this should be paginated or processed in batches
        List<Article> articles = articleService.list(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, ArticleStatus.PUBLISHED));
        
        for (Article article : articles) {
            updateArticleScore(article);
        }
        
        // Batch update is better, but MP default batch update can be slow if not configured correctly.
        // For simplicity, we update one by one or use updateBatchById if ServiceImpl provides it.
        if (!articles.isEmpty()) {
            articleService.updateBatchById(articles);
        }
        
        log.info("Article score calculation completed. Processed {} articles.", articles.size());
    }
    
    private void updateArticleScore(Article article) {
        // Formula: Score = (W + I) / (T + 1)^G
        // W (Weighted Interactions) = View*1 + Like*2 + Comment*5
        // T (Time) = Hours since published
        // G (Gravity) = 1.5 (Standard news gravity)
        
        int views = article.getViewCount() == null ? 0 : article.getViewCount();
        int likes = article.getLikeCount() == null ? 0 : article.getLikeCount();
        int comments = article.getCommentCount() == null ? 0 : article.getCommentCount();
        
        double weightedInteractions = views * 1.0 + likes * 2.0 + comments * 5.0;
        
        long hoursSincePublished = 0;
        if (article.getPublishedAt() != null) {
            hoursSincePublished = Duration.between(article.getPublishedAt(), LocalDateTime.now()).toHours();
            if (hoursSincePublished < 0) hoursSincePublished = 0;
        }
        
        double gravity = 1.5;
        double score = weightedInteractions / Math.pow(hoursSincePublished + 2, gravity);
        
        article.setScore(score);
    }
}
