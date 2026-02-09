package com.myvlog.blog.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.myvlog.blog.entity.*;
import com.myvlog.blog.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupServiceImpl implements BackupService {

    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final CommentService commentService;
    private final UserService userService;
    private final SystemConfigService systemConfigService;
    private final DeadLinkService deadLinkService;

    @Override
    public File performBackup() {
        log.info("Starting system backup...");
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("myvlog_backup_");
            final Path finalTempDir = tempDir;
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());

            // 1. Export Data to JSON
            exportTable(tempDir, "articles.json", articleService.list(), mapper);
            exportTable(tempDir, "categories.json", categoryService.list(), mapper);
            exportTable(tempDir, "tags.json", tagService.list(), mapper);
            exportTable(tempDir, "comments.json", commentService.list(), mapper);
            exportTable(tempDir, "users.json", userService.list(), mapper);
            exportTable(tempDir, "system_configs.json", systemConfigService.list(), mapper);
            exportTable(tempDir, "dead_links.json", deadLinkService.list(), mapper);

            // 2. Zip files
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            File zipFile = new File("backups/backup_" + timestamp + ".zip");
            if (!zipFile.getParentFile().exists()) {
                zipFile.getParentFile().mkdirs();
            }

            try (FileOutputStream fos = new FileOutputStream(zipFile);
                 ZipOutputStream zos = new ZipOutputStream(fos)) {

                Files.walk(tempDir)
                        .filter(path -> !Files.isDirectory(path))
                        .forEach(path -> {
                            ZipEntry zipEntry = new ZipEntry(finalTempDir.relativize(path).toString());
                            try {
                                zos.putNextEntry(zipEntry);
                                Files.copy(path, zos);
                                zos.closeEntry();
                            } catch (IOException e) {
                                log.error("Error zipping file: {}", path, e);
                            }
                        });
            }

            log.info("Backup completed: {}", zipFile.getAbsolutePath());
            return zipFile;

        } catch (IOException e) {
            log.error("Backup failed", e);
            throw new RuntimeException("Backup failed", e);
        } finally {
            // Cleanup temp dir
            if (tempDir != null) {
                try {
                    // Simple cleanup
                    Files.walk(tempDir)
                            .sorted((a, b) -> b.compareTo(a)) // Delete files first
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (IOException e) {
                    log.warn("Failed to cleanup temp dir: {}", tempDir);
                }
            }
        }
    }

    private void exportTable(Path dir, String filename, List<?> data, ObjectMapper mapper) throws IOException {
        File file = dir.resolve(filename).toFile();
        mapper.writeValue(file, data);
    }
}
