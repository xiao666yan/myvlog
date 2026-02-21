package com.myvlog.blog.service.impl;

import com.myvlog.blog.service.AiService;
import org.springframework.stereotype.Service;

@Service
public class AiServiceImpl implements AiService {

    @Override
    public String generateSummary(String content) {
        // TODO: Integrate with OpenAI/Anthropic/Gemini API
        return "AI Summary generation is not configured yet.";
    }

    @Override
    public String suggestTitle(String content) {
        // TODO: Integrate with AI
        return "AI Title Suggestion";
    }

    @Override
    public String chat(String message) {
        return "I am an AI assistant placeholder.";
    }
}
