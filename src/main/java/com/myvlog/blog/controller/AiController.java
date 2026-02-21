package com.myvlog.blog.controller;

import com.myvlog.blog.annotation.Log;
import com.myvlog.blog.annotation.RateLimit;
import com.myvlog.blog.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/summary")
    @RateLimit(limit = 10, timeout = 1, unit = TimeUnit.MINUTES)
    @Log(module = "AI", action = "Generate Summary", description = "AI Summary Generation")
    public ResponseEntity<Map<String, String>> generateSummary(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String summary = aiService.generateSummary(content);
        
        Map<String, String> response = new HashMap<>();
        response.put("summary", summary);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/title")
    @RateLimit(limit = 10, timeout = 1, unit = TimeUnit.MINUTES)
    @Log(module = "AI", action = "Suggest Title", description = "AI Title Suggestion")
    public ResponseEntity<Map<String, String>> suggestTitle(@RequestBody Map<String, String> body) {
        String content = body.get("content");
        String title = aiService.suggestTitle(content);
        
        Map<String, String> response = new HashMap<>();
        response.put("title", title);
        return ResponseEntity.ok(response);
    }
}
