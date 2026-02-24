package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.UserAnnouncementRead;

import java.util.List;

public interface UserAnnouncementReadService extends IService<UserAnnouncementRead> {
    void markAsRead(Long userId, Long announcementId);
    List<Long> getReadAnnouncementIds(Long userId);
    boolean hasRead(Long userId, Long announcementId);
}
