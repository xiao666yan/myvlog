package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Article;
import com.myvlog.blog.entity.Comment;
import com.myvlog.blog.entity.DeadLink;
import com.myvlog.blog.mapper.ArticleMapper;
import com.myvlog.blog.mapper.CommentMapper;
import com.myvlog.blog.mapper.DeadLinkMapper;
import com.myvlog.blog.service.DeadLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeadLinkServiceImpl extends ServiceImpl<DeadLinkMapper, DeadLink> implements DeadLinkService {

    private final ArticleMapper articleMapper;
    private final CommentMapper commentMapper;

    // Regex to extract URLs from Markdown: [text](url) or direct links
    // Simplifying to capture http/https links
    private static final Pattern URL_PATTERN = Pattern.compile("(https?://[^\\s\\)\\]\"']+)");

    private final ExecutorService executor = Executors.newFixedThreadPool(10); // Concurrent checks

    @Override
    @Async // Run in background
    public void scanDeadLinks() {
        log.info("Starting dead link scan...");
        
        // 1. Clear existing reports (Optional: Strategy can be adjusted to update instead)
        // For now, full rescan and replace is safer to remove fixed links
        remove(new LambdaQueryWrapper<>());

        // 2. Scan Articles
        scanArticles();

        // 3. Scan Comments
        scanComments();

        log.info("Dead link scan completed.");
    }

    private void scanArticles() {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .select(Article::getId, Article::getTitle, Article::getContent));
        
        for (Article article : articles) {
            if (!StringUtils.hasText(article.getContent())) continue;
            
            Set<String> urls = extractUrls(article.getContent());
            for (String url : urls) {
                checkAndSave(url, "ARTICLE", article.getId());
            }
        }
    }

    private void scanComments() {
        List<Comment> comments = commentMapper.selectList(new LambdaQueryWrapper<Comment>()
                .select(Comment::getId, Comment::getContent));
        
        for (Comment comment : comments) {
            if (!StringUtils.hasText(comment.getContent())) continue;
            
            Set<String> urls = extractUrls(comment.getContent());
            for (String url : urls) {
                checkAndSave(url, "COMMENT", comment.getId());
            }
        }
    }

    private Set<String> extractUrls(String content) {
        Set<String> urls = new HashSet<>();
        Matcher matcher = URL_PATTERN.matcher(content);
        while (matcher.find()) {
            urls.add(matcher.group(1));
        }
        return urls;
    }

    private void checkAndSave(String urlStr, String sourceType, Long sourceId) {
        // Use a separate thread or CompletableFuture if mass checking, 
        // but for simplicity in this method we call sync or submit to executor
        executor.submit(() -> {
            int status = checkUrl(urlStr);
            if (status >= 400 || status == -1) {
                DeadLink deadLink = new DeadLink();
                deadLink.setUrl(urlStr);
                deadLink.setStatusCode(status);
                deadLink.setErrorMessage(status == -1 ? "Connection Failed" : "HTTP Error");
                deadLink.setSourceType(sourceType);
                deadLink.setSourceId(sourceId);
                save(deadLink);
                log.warn("Dead link found: {} in {} ID {}", urlStr, sourceType, sourceId);
            }
        });
    }

    @Override
    public int checkUrl(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            connection.setRequestProperty("User-Agent", "CodeCanvas-LinkChecker/1.0");
            
            int code = connection.getResponseCode();
            
            // Some servers don't support HEAD, try GET
            if (code == HttpURLConnection.HTTP_BAD_METHOD || code == 405) {
                connection.disconnect();
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                connection.setRequestProperty("User-Agent", "CodeCanvas-LinkChecker/1.0");
                code = connection.getResponseCode();
            }
            
            return code;
        } catch (IOException e) {
            return -1;
        }
    }
}
