package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.TagDto;
import com.myvlog.blog.entity.Tag;
import com.myvlog.blog.mapper.TagMapper;
import com.myvlog.blog.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag> implements TagService {

    private final TagMapper tagMapper;

    @Override
    @Transactional
    public TagDto createTag(TagDto tagDto) {
        Tag tag = new Tag();
        BeanUtils.copyProperties(tagDto, tag);
        
        if (tag.getSlug() == null || tag.getSlug().isEmpty()) {
            tag.setSlug(UUID.randomUUID().toString().substring(0, 8));
        }

        // Check duplicate slug
        if (tagMapper.selectCount(new LambdaQueryWrapper<Tag>().eq(Tag::getSlug, tag.getSlug())) > 0) {
            throw new RuntimeException("Tag slug already exists");
        }

        tagMapper.insert(tag);
        
        TagDto result = new TagDto();
        BeanUtils.copyProperties(tag, result);
        return result;
    }

    @Override
    @Transactional
    public TagDto updateTag(Long id, TagDto tagDto) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new RuntimeException("Tag not found");
        }

        BeanUtils.copyProperties(tagDto, tag, "id", "createdAt");
        tagMapper.updateById(tag);
        
        TagDto result = new TagDto();
        BeanUtils.copyProperties(tag, result);
        return result;
    }

    @Override
    @Transactional
    public void deleteTag(Long id) {
        tagMapper.deleteById(id);
    }

    @Override
    public List<TagDto> getAllTags() {
        return tagMapper.selectList(null)
                .stream()
                .map(tag -> {
                    TagDto dto = new TagDto();
                    BeanUtils.copyProperties(tag, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
