-- 专栏功能数据库表
-- Created at: 2026-02-24

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. Columns Table (专栏表)
-- ----------------------------
DROP TABLE IF EXISTS `columns`;
CREATE TABLE `columns` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` VARCHAR(100) NOT NULL COMMENT '专栏名称',
  `slug` VARCHAR(100) NOT NULL COMMENT '专栏别名(URL友好)',
  `description` TEXT DEFAULT NULL COMMENT '专栏描述',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父专栏ID(支持多级)',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专栏表';

-- ----------------------------
-- 2. Article Columns Relation (文章-专栏关联)
-- ----------------------------
DROP TABLE IF EXISTS `article_columns`;
CREATE TABLE `article_columns` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
  `column_id` BIGINT UNSIGNED NOT NULL COMMENT '专栏ID',
  `sort_order` INT DEFAULT 0 COMMENT '在专栏中的排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_column` (`article_id`, `column_id`),
  KEY `idx_column_id` (`column_id`),
  CONSTRAINT `fk_ac_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ac_column` FOREIGN KEY (`column_id`) REFERENCES `columns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章-专栏关联表';

-- ----------------------------
-- 3. Learning Notes (学习笔记)
-- ----------------------------
DROP TABLE IF EXISTS `learning_notes`;
CREATE TABLE `learning_notes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID(未登录则为NULL)',
  `content` TEXT NOT NULL COMMENT '笔记内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_note_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_note_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习笔记表';

-- ----------------------------
-- 4. Learning Progress (学习进度)
-- ----------------------------
DROP TABLE IF EXISTS `learning_progress`;
CREATE TABLE `learning_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
  `progress` INT DEFAULT 0 COMMENT '学习进度百分比(0-100)',
  `last_read_at` DATETIME DEFAULT NULL COMMENT '最后阅读时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_article_id` (`article_id`),
  CONSTRAINT `fk_lp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习进度表';

-- ----------------------------
-- 5. User Announcement Read Status (用户公告已读状态)
-- ----------------------------
DROP TABLE IF EXISTS `user_announcement_reads`;
CREATE TABLE `user_announcement_reads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `announcement_id` BIGINT UNSIGNED NOT NULL COMMENT '公告ID',
  `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_announcement` (`user_id`, `announcement_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_announcement_id` (`announcement_id`),
  CONSTRAINT `fk_uar_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uar_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户公告已读状态表';

SET FOREIGN_KEY_CHECKS = 1;
