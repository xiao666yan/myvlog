package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.LearningProgressDto;
import com.myvlog.blog.entity.LearningProgress;

public interface LearningProgressService extends IService<LearningProgress> {
    LearningProgressDto updateProgress(Long userId, Long articleId, Integer progress);
    LearningProgressDto getProgress(Long userId, Long articleId);
    LearningProgressDto getContinueLearning(Long userId);
}
