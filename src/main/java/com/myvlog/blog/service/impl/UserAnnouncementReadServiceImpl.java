package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.UserAnnouncementRead;
import com.myvlog.blog.mapper.UserAnnouncementReadMapper;
import com.myvlog.blog.service.UserAnnouncementReadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAnnouncementReadServiceImpl extends ServiceImpl<UserAnnouncementReadMapper, UserAnnouncementRead> implements UserAnnouncementReadService {

    @Override
    @Transactional
    public void markAsRead(Long userId, Long announcementId) {
        LambdaQueryWrapper<UserAnnouncementRead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserAnnouncementRead::getUserId, userId)
                .eq(UserAnnouncementRead::getAnnouncementId, announcementId);
        
        UserAnnouncementRead existing = getOne(wrapper);
        if (existing == null) {
            UserAnnouncementRead read = new UserAnnouncementRead();
            read.setUserId(userId);
            read.setAnnouncementId(announcementId);
            read.setReadAt(LocalDateTime.now());
            save(read);
        }
    }

    @Override
    public List<Long> getReadAnnouncementIds(Long userId) {
        LambdaQueryWrapper<UserAnnouncementRead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserAnnouncementRead::getUserId, userId)
                .select(UserAnnouncementRead::getAnnouncementId);
        return list(wrapper).stream()
                .map(UserAnnouncementRead::getAnnouncementId)
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasRead(Long userId, Long announcementId) {
        LambdaQueryWrapper<UserAnnouncementRead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserAnnouncementRead::getUserId, userId)
                .eq(UserAnnouncementRead::getAnnouncementId, announcementId);
        return count(wrapper) > 0;
    }
}
