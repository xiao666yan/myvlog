package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.LearningNoteDto;
import com.myvlog.blog.entity.LearningNote;
import com.myvlog.blog.mapper.LearningNoteMapper;
import com.myvlog.blog.service.LearningNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningNoteServiceImpl extends ServiceImpl<LearningNoteMapper, LearningNote> implements LearningNoteService {

    private final LearningNoteMapper learningNoteMapper;

    @Override
    @Transactional
    public LearningNoteDto createNote(LearningNoteDto noteDto, Long userId) {
        LearningNote note = new LearningNote();
        BeanUtils.copyProperties(noteDto, note);
        note.setUserId(userId);

        learningNoteMapper.insert(note);

        LearningNoteDto result = new LearningNoteDto();
        BeanUtils.copyProperties(note, result);
        return result;
    }

    @Override
    @Transactional
    public void deleteNote(Long id, Long userId) {
        LearningNote note = learningNoteMapper.selectById(id);
        if (note == null) {
            throw new RuntimeException("Note not found");
        }

        // Only allow delete by note owner or admin
        if (userId != null && !userId.equals(note.getUserId())) {
            throw new RuntimeException("Not authorized to delete this note");
        }

        learningNoteMapper.deleteById(id);
    }

    @Override
    public List<LearningNoteDto> getNotesByArticleId(Long articleId) {
        return learningNoteMapper.selectByArticleId(articleId)
                .stream()
                .map(note -> {
                    LearningNoteDto dto = new LearningNoteDto();
                    BeanUtils.copyProperties(note, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<LearningNoteDto> getNotesByArticleIdAndUserId(Long articleId, Long userId) {
        return learningNoteMapper.selectByArticleIdAndUserId(articleId, userId)
                .stream()
                .map(note -> {
                    LearningNoteDto dto = new LearningNoteDto();
                    BeanUtils.copyProperties(note, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
