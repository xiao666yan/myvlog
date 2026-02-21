package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.DeadLink;

public interface DeadLinkService extends IService<DeadLink> {
    /**
     * Trigger a full scan of articles and comments for dead links.
     */
    void scanDeadLinks();

    /**
     * Check a specific URL and return status code.
     * Returns -1 if exception occurs.
     */
    int checkUrl(String url);
}
