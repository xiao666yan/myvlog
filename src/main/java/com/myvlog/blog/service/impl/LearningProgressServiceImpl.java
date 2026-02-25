package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.LearningProgressDto;
import com.myvlog.blog.entity.LearningProgress;
import com.myvlog.blog.mapper.LearningProgressMapper;
import com.myvlog.blog.service.LearningProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LearningProgressServiceImpl extends ServiceImpl<LearningProgressMapper, LearningProgress> implements LearningProgressService {

    private final LearningProgressMapper learningProgressMapper;

    @Override
    @Transactional
    public LearningProgressDto updateProgress(Long userId, Long articleId, Integer progress) {
        LearningProgress learningProgress = learningProgressMapper.selectByUserIdAndArticleId(userId, articleId);

        if (learningProgress == null) {
            learningProgress = new LearningProgress();
            learningProgress.setUserId(userId);
            learningProgress.setArticleId(articleId);
            learningProgress.setProgress(progress);
            learningProgress.setLastReadAt(LocalDateTime.now());
            learningProgressMapper.insert(learningProgress);
        } else {
            learningProgress.setProgress(progress);
            learningProgress.setLastReadAt(LocalDateTime.now());
            learningProgressMapper.updateById(learningProgress);
        }

        LearningProgressDto result = new LearningProgressDto();
        BeanUtils.copyProperties(learningProgress, result);
        return result;
    }

    @Override
    public LearningProgressDto getProgress(Long userId, Long articleId) {
        LearningProgress learningProgress = learningProgressMapper.selectByUserIdAndArticleId(userId, articleId);

        if (learningProgress == null) {
            return null;
        }

        LearningProgressDto result = new LearningProgressDto();
        BeanUtils.copyProperties(learningProgress, result);
        return result;
    }

    @Override
    public LearningProgressDto getContinueLearning(Long userId) {
        // Find the article with the most recent lastReadAt that has progress < 100
        // This is a simplified implementation - you might want to customize this logic
        return null;
    }
}
