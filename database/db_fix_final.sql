USE myvlog;

DROP PROCEDURE IF EXISTS upgrade_database;

DELIMITER $$
CREATE PROCEDURE upgrade_database()
BEGIN
    -- Add score column
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'myvlog' 
        AND TABLE_NAME = 'articles' 
        AND COLUMN_NAME = 'score'
    ) THEN
        ALTER TABLE articles ADD COLUMN score DOUBLE DEFAULT 0 COMMENT '综合热度分';
        ALTER TABLE articles ADD INDEX idx_score (score);
    END IF;

    -- Create article_likes table
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章点赞表';

    -- Create dead_links table
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='死链检测结果表';

    -- Create system_configs table
    CREATE TABLE IF NOT EXISTS `system_configs` (
      `key` VARCHAR(100) NOT NULL COMMENT '配置键',
      `value` TEXT DEFAULT NULL COMMENT '配置值',
      `type` VARCHAR(20) DEFAULT 'string' COMMENT '数据类型: string, number, boolean, json',
      `description` VARCHAR(255) DEFAULT NULL COMMENT '配置说明',
      `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

END$$
DELIMITER ;

CALL upgrade_database();
DROP PROCEDURE upgrade_database;
