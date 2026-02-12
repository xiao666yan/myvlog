package com.myvlog.blog.config;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.myvlog.blog.dto.CategoryDto;
import com.myvlog.blog.entity.User;
import com.myvlog.blog.mapper.UserMapper;
import com.myvlog.blog.service.CategoryService;
import com.myvlog.blog.service.SystemConfigService;
import com.myvlog.blog.utils.NameUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final CategoryService categoryService;
    private final PasswordEncoder passwordEncoder;
    private final com.myvlog.blog.mapper.ProductMapper productMapper;
    private final com.myvlog.blog.mapper.ProjectMapper projectMapper;
    private final SystemConfigService systemConfigService;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");
        
        initDatabaseSchema();
        initAdminUser();
        initDefaultCategories();
        initDefaultProducts();
        systemConfigService.initDefaultConfigs();
        initNicknames();
        initDefaultProjects();
        
        log.info("Data initialization completed.");
    }

    private void initDefaultProjects() {
        if (projectMapper.selectCount(null) == 0) {
            log.info("Initializing default projects...");
            User admin = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, "admin"));
            if (admin != null) {
                com.myvlog.blog.entity.Project p1 = new com.myvlog.blog.entity.Project();
                p1.setUserId(admin.getId());
                p1.setTitle("My Personal Blog");
                p1.setDescription("A modern blog system built with Spring Boot and Vue 3.");
                p1.setUrl("https://github.com/myvlog/blog");
                p1.setStatus("active");
                projectMapper.insert(p1);

                com.myvlog.blog.entity.Project p2 = new com.myvlog.blog.entity.Project();
                p2.setUserId(admin.getId());
                p2.setTitle("AI Assistant Tool");
                p2.setDescription("An AI-powered tool to help developers write code faster.");
                p2.setUrl("https://github.com/myvlog/ai-tool");
                p2.setStatus("development");
                projectMapper.insert(p2);
                
                log.info("Default projects initialized.");
            }
        }
    }

    private void initNicknames() {
        List<User> users = userMapper.selectList(new LambdaQueryWrapper<User>().isNull(User::getNickname).or().eq(User::getNickname, ""));
        if (!users.isEmpty()) {
            log.info("Initializing nicknames for {} users...", users.size());
            for (User user : users) {
                user.setNickname(NameUtils.generateRandomName());
                userMapper.updateById(user);
            }
            log.info("Nicknames initialized.");
        }
    }

    private void initDatabaseSchema() {
        log.info("Checking and updating database schema...");
        try {
            // Add score column to articles if not exists
            try {
                jdbcTemplate.execute("ALTER TABLE articles ADD COLUMN score DOUBLE DEFAULT 0 COMMENT '综合热度分'");
                jdbcTemplate.execute("ALTER TABLE articles ADD INDEX idx_score (score)");
                log.info("Added score column to articles table.");
            } catch (Exception e) {
                // Ignore if column exists
                log.info("Score column check: " + e.getMessage());
            }

            // Add preferences column to users if not exists
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN preferences TEXT DEFAULT NULL COMMENT '用户偏好设置'");
                log.info("Added preferences column to users table.");
            } catch (Exception e) {
                // Ignore if column exists
                log.info("Preferences column check: " + e.getMessage());
            }

            // Add nickname column to users if not exists
            try {
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称'");
                log.info("Added nickname column to users table.");
            } catch (Exception e) {
                // Ignore if column exists
                log.info("Nickname column check: " + e.getMessage());
            }

            // Add missing columns to operation_logs if not exists
            try {
                // We attempt to add columns one by one. If they exist, it throws exception which we catch/ignore.
                // This is a simple migration strategy for dev environment.
                String[] columnsToAdd = {
                    "ADD COLUMN username VARCHAR(50) DEFAULT NULL COMMENT '用户名'",
                    "ADD COLUMN module VARCHAR(50) DEFAULT NULL COMMENT '模块'",
                    "ADD COLUMN action VARCHAR(50) DEFAULT NULL COMMENT '操作'",
                    "ADD COLUMN description VARCHAR(255) DEFAULT NULL COMMENT '描述'",
                    "ADD COLUMN method VARCHAR(255) DEFAULT NULL COMMENT '方法名'",
                    "ADD COLUMN params TEXT DEFAULT NULL COMMENT '参数'",
                    "ADD COLUMN ip_address VARCHAR(50) DEFAULT NULL COMMENT 'IP地址'",
                    "ADD COLUMN user_agent VARCHAR(255) DEFAULT NULL COMMENT 'User Agent'",
                    "ADD COLUMN execution_time BIGINT DEFAULT 0 COMMENT '执行时间(ms)'"
                };
                
                for (String colDef : columnsToAdd) {
                    try {
                        jdbcTemplate.execute("ALTER TABLE operation_logs " + colDef);
                    } catch (Exception e) {
                        // Ignore "Duplicate column name" error
                    }
                }
                log.info("Checked/Added columns to operation_logs table.");
            } catch (Exception e) {
                log.info("OperationLog schema check failed: " + e.getMessage());
            }

            // Fix columns length for operation_logs
            try {
                 jdbcTemplate.execute("ALTER TABLE operation_logs MODIFY COLUMN method TEXT COMMENT '方法名'");
                 jdbcTemplate.execute("ALTER TABLE operation_logs MODIFY COLUMN user_agent TEXT COMMENT 'User Agent'");
                 log.info("Modified method/user_agent columns to TEXT.");
            } catch (Exception e) {
                 log.info("Column modify failed: " + e.getMessage());
            }

            // Ensure timestamp columns exist for operation_logs
            try {
                try {
                    jdbcTemplate.execute("ALTER TABLE operation_logs ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
                } catch (Exception e) {
                    // Ignore duplicate column errors
                }
                try {
                    jdbcTemplate.execute("ALTER TABLE operation_logs ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                } catch (Exception e) {
                    // Ignore duplicate column errors
                }
                log.info("Ensured created_at/updated_at columns exist on operation_logs.");
            } catch (Exception e) {
                log.info("Timestamp column ensure failed for operation_logs: " + e.getMessage());
            }

            // Create article_likes table if not exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `article_likes` (
                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                  `article_id` BIGINT UNSIGNED NOT NULL,
                  `user_id` BIGINT UNSIGNED NOT NULL,
                  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `uk_article_user` (`article_id`, `user_id`),
                  CONSTRAINT `fk_like_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
                  CONSTRAINT `fk_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章点赞表'
            """);

            // Migrate article_tags to have ID column if missing
            try {
                Integer count = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'article_tags' AND column_name = 'id'",
                    Integer.class
                );
                
                if (count != null && count == 0) {
                    log.info("Migrating article_tags table to include ID column...");
                    
                    // 1. Drop foreign keys first to avoid constraint errors
                    try {
                        // Dynamically find FK names if possible, or try common names
                        List<String> fkNames = jdbcTemplate.queryForList(
                            "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'article_tags' " +
                            "AND REFERENCED_TABLE_NAME IS NOT NULL",
                            String.class
                        );
                        
                        for (String fkName : fkNames) {
                            try {
                                jdbcTemplate.execute("ALTER TABLE article_tags DROP FOREIGN KEY " + fkName);
                                log.info("Dropped foreign key: " + fkName);
                            } catch (Exception e) {
                                log.warn("Failed to drop FK {}: {}", fkName, e.getMessage());
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Failed to query foreign keys: " + e.getMessage());
                    }
                    
                    // 2. Drop existing primary key (composite)
                    try {
                        jdbcTemplate.execute("ALTER TABLE article_tags DROP PRIMARY KEY");
                        log.info("Dropped primary key of article_tags.");
                    } catch (Exception e) {
                        log.warn("PK drop failed: " + e.getMessage());
                        // If it fails because of FK, we might need to drop other indexes too
                        try {
                            // In some cases, there might be other indexes on these columns
                            jdbcTemplate.execute("DROP INDEX article_id ON article_tags");
                        } catch (Exception ex) {}
                        try {
                            jdbcTemplate.execute("DROP INDEX tag_id ON article_tags");
                        } catch (Exception ex) {}
                    }
                    
                    // 3. Add id column
                    try {
                        jdbcTemplate.execute("ALTER TABLE article_tags ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST");
                        log.info("Added ID column to article_tags.");
                    } catch (Exception e) {
                        log.error("Add ID column failed: " + e.getMessage());
                    }
                    
                    // 4. Add unique constraint for compatibility
                    try {
                        jdbcTemplate.execute("ALTER TABLE article_tags ADD UNIQUE KEY uk_article_tag (article_id, tag_id)");
                    } catch (Exception e) { log.info("Add Unique Key failed: " + e.getMessage()); }

                    // 5. Re-add foreign keys
                    try {
                        jdbcTemplate.execute("ALTER TABLE article_tags ADD CONSTRAINT fk_at_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE");
                        jdbcTemplate.execute("ALTER TABLE article_tags ADD CONSTRAINT fk_at_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE");
                    } catch (Exception e) { log.info("Re-add FK failed: " + e.getMessage()); }
                    
                    log.info("Migrated article_tags table successfully.");
                }
            } catch (Exception e) {
                log.error("Failed to check/migrate article_tags schema: " + e.getMessage());
            }

            // Create dead_links table if not exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `dead_links` (
                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                  `url` VARCHAR(2048) NOT NULL COMMENT '失效链接URL',
                  `status_code` INT DEFAULT NULL COMMENT 'HTTP状态码',
                  `error_message` TEXT DEFAULT NULL COMMENT '错误信息',
                  `source_type` VARCHAR(20) NOT NULL COMMENT '来源类型: ARTICLE, COMMENT',
                  `source_id` BIGINT UNSIGNED NOT NULL COMMENT '来源ID (文章ID或评论ID)',
                  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '检测时间',
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`),
                  KEY `idx_source` (`source_type`, `source_id`),
                  KEY `idx_created_at` (`created_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='死链检测结果表'
            """);

            // Create system_configs table if not exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `system_configs` (
                  `key` VARCHAR(100) NOT NULL COMMENT '配置键',
                  `value` TEXT DEFAULT NULL COMMENT '配置值',
                  `type` VARCHAR(20) DEFAULT 'string' COMMENT '数据类型: string, number, boolean, json',
                  `description` VARCHAR(255) DEFAULT NULL COMMENT '配置说明',
                  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`key`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表'
            """);
            
            // Create projects table if not exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `projects` (
                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                  `user_id` BIGINT UNSIGNED NOT NULL,
                  `title` VARCHAR(255) NOT NULL COMMENT '项目名称',
                  `description` TEXT DEFAULT NULL COMMENT '项目描述',
                  `url` VARCHAR(255) DEFAULT NULL COMMENT '项目链接',
                  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
                  `status` VARCHAR(50) DEFAULT 'active' COMMENT '状态',
                  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`),
                  KEY `idx_user_id` (`user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户项目表'
            """);

            // Create announcements table if not exists
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS `announcements` (
                  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                  `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
                  `content` TEXT NOT NULL COMMENT '公告内容',
                  `type` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '公告类型',
                  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活展示',
                  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`),
                  KEY `idx_is_active` (`is_active`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统公告表'
            """);

            // Add missing columns to products if not exists (migration)
            try {
                jdbcTemplate.execute("ALTER TABLE products ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
                log.info("Added created_at to products.");
            } catch (Exception e) { /* Ignore */ }
            try {
                jdbcTemplate.execute("ALTER TABLE products ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                log.info("Added updated_at to products.");
            } catch (Exception e) { /* Ignore */ }

            // Add missing updated_at to tags if not exists (migration)
            try {
                jdbcTemplate.execute("ALTER TABLE tags ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                log.info("Added updated_at to tags.");
            } catch (Exception e) { /* Ignore */ }

            // Add missing updated_at to other tables (migration)
            String[] tablesToMigrate = {"comments", "friend_links", "attachments", "operation_logs", "webhooks", "subscribers"};
            for (String table : tablesToMigrate) {
                try {
                    jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                    log.info("Added updated_at to " + table + ".");
                } catch (Exception e) { /* Ignore */ }
            }

            log.info("Database schema update completed.");
        } catch (Exception e) {
            log.error("Database schema update failed: " + e.getMessage());
        }
    }

    private void initDefaultProducts() {
        if (productMapper.selectCount(null) == 0) {
            log.info("Creating default products...");
            
            com.myvlog.blog.entity.Product monthly = new com.myvlog.blog.entity.Product();
            monthly.setName("VIP Monthly");
            monthly.setDescription("Unlock all VIP articles for 1 month");
            monthly.setPrice(new java.math.BigDecimal("9.99"));
            monthly.setType("vip_monthly");
            monthly.setIsActive(true);
            productMapper.insert(monthly);
            
            com.myvlog.blog.entity.Product yearly = new com.myvlog.blog.entity.Product();
            yearly.setName("VIP Yearly");
            yearly.setDescription("Unlock all VIP articles for 1 year");
            yearly.setPrice(new java.math.BigDecimal("99.99"));
            yearly.setType("vip_yearly");
            yearly.setIsActive(true);
            productMapper.insert(yearly);
            
            log.info("Default products created.");
        }
    }

    private void initAdminUser() {
        String adminUsername = "admin";
        
        // Check if admin exists
        Long count = userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, adminUsername));
                
        if (count == 0) {
            log.info("Creating default admin user...");
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail("admin@myvlog.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123")); // Default password
            admin.setNickname("Admin");
            admin.setRole("admin");
            admin.setStatus(1);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            
            userMapper.insert(admin);
            log.info("Admin user created with username 'admin' and password 'admin123'");
        } else {
            log.info("Admin user already exists.");
        }
    }

    private void initDefaultCategories() {
        List<String> defaultCategories = Arrays.asList("Java", "Spring Boot", "AI", "Database", "Frontend", "生活随笔");
        
        for (String catName : defaultCategories) {
            try {
                // Ideally CategoryService should have a method to check existence or create if not exists
                // Since our createCategory implementation in service might throw error if slug exists (assuming duplicate check)
                // We will try to create and catch exception, or check existence first if service exposes it.
                // However, CategoryService interface showed getAllCategories. Let's iterate.
                
                // Better approach: check by slug/name via service if possible, or just catch duplicates
                CategoryDto categoryDto = new CategoryDto();
                categoryDto.setName(catName);
                categoryDto.setDescription("Category for " + catName);
                
                // Slug generation is handled in service
                
                // We use a try-catch block because createCategory might throw exception if duplicate name/slug
                // But current service implementation (from previous turns) handles slug generation.
                // It might throw if name duplicate check exists.
                
                // Let's assume createCategory is safe to call and will fail if exists
                // Or better, let's just check if we can query. 
                // Since I don't have direct access to CategoryMapper here (I injected Service), 
                // and getAllCategories might be expensive if many categories.
                // But for init, it's fine.
                
                boolean exists = categoryService.getAllCategories().stream()
                        .anyMatch(c -> c.getName().equalsIgnoreCase(catName));
                
                if (!exists) {
                    categoryService.createCategory(categoryDto);
                    log.info("Category '{}' created.", catName);
                }
                
            } catch (Exception e) {
                log.warn("Failed to init category '{}': {}", catName, e.getMessage());
            }
        }
    }
}
