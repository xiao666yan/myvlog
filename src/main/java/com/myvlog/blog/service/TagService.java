package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.TagDto;
import com.myvlog.blog.entity.Tag;
import java.util.List;

public interface TagService extends IService<Tag> {
    TagDto createTag(TagDto tagDto);
    TagDto updateTag(Long id, TagDto tagDto);
    void deleteTag(Long id);
    List<TagDto> getAllTags();
}
