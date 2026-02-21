package com.myvlog.blog.service;

import java.util.Map;

public interface AiService {
    
    /**
     * Generate summary for content
     */
    String generateSummary(String content);
    
    /**
     * Suggest titles for content
     */
    String suggestTitle(String content);
    
    /**
     * Chat with AI
     */
    String chat(String message);
}
