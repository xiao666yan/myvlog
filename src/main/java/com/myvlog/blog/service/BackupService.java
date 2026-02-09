package com.myvlog.blog.service;

import java.io.File;

public interface BackupService {
    
    /**
     * Perform a full data backup
     * @return The backup file (zip)
     */
    File performBackup();
    
    /**
     * List available backups
     */
    // List<String> listBackups();
}
