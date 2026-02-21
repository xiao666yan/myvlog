package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.Announcement;

import java.util.List;

public interface AnnouncementService extends IService<Announcement> {
    List<Announcement> getActiveAnnouncements();
    void createUpdateAnnouncement(String content);
}
