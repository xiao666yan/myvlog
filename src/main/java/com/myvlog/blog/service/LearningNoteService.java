package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.LearningNoteDto;
import com.myvlog.blog.entity.LearningNote;
import java.util.List;

public interface LearningNoteService extends IService<LearningNote> {
    LearningNoteDto createNote(LearningNoteDto noteDto, Long userId);
    void deleteNote(Long id, Long userId);
    List<LearningNoteDto> getNotesByArticleId(Long articleId);
    List<LearningNoteDto> getNotesByArticleIdAndUserId(Long articleId, Long userId);
}
