package com.myvlog.blog.task;

import com.myvlog.blog.service.DeadLinkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LinkHealthCheckTask {

    private final DeadLinkService deadLinkService;

    /**
     * Run dead link scan every day at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void scheduleLinkScan() {
        log.info("Scheduled Dead Link Scan Task started.");
        deadLinkService.scanDeadLinks();
    }
}
