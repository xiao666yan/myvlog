package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Announcement;
import com.myvlog.blog.mapper.AnnouncementMapper;
import com.myvlog.blog.service.AnnouncementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AnnouncementServiceImpl extends ServiceImpl<AnnouncementMapper, Announcement> implements AnnouncementService {

    @Override
    public List<Announcement> getActiveAnnouncements() {
        List<Announcement> list = lambdaQuery()
                .eq(Announcement::getIsActive, true)
                .orderByDesc(Announcement::getCreatedAt)
                .list();
        System.out.println("DEBUG: getActiveAnnouncements found " + (list != null ? list.size() : 0) + " announcements");
        if (list != null && !list.isEmpty()) {
            System.out.println("DEBUG: First announcement: " + list.get(0));
        }
        return list;
    }

    @Override
    @Transactional
    public void createUpdateAnnouncement(String content) {
        Announcement announcement = new Announcement();
        announcement.setTitle("系统更新公告");
        announcement.setContent(content);
        announcement.setType("system_update");
        announcement.setIsActive(true);
        save(announcement);
    }
}
