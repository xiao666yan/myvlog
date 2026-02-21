package com.myvlog.blog.task;

import com.myvlog.blog.service.BackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class BackupTask {

    private final BackupService backupService;

    // Daily at 2:00 AM
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduleBackup() {
        log.info("Executing scheduled backup task...");
        try {
            backupService.performBackup();
        } catch (Exception e) {
            log.error("Scheduled backup failed", e);
        }
    }
}
