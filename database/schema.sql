-- MyVlog Database Schema (MySQL)
-- Created at: 2026-01-21
-- Author: Trae AI

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 1. Users Table (用户表)
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '加密密码',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `bio` VARCHAR(255) DEFAULT NULL COMMENT '个人简介',
  `role` ENUM('user', 'admin', 'vip') NOT NULL DEFAULT 'user' COMMENT '角色: user-普通用户, admin-管理员, vip-会员',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `vip_expire_at` DATETIME DEFAULT NULL COMMENT '会员过期时间',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. Social Accounts Table (第三方登录)
-- ----------------------------
DROP TABLE IF EXISTS `social_accounts`;
CREATE TABLE `social_accounts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '关联用户ID',
  `provider` VARCHAR(50) NOT NULL COMMENT '提供商: github, google, wechat',
  `provider_user_id` VARCHAR(100) NOT NULL COMMENT '第三方用户ID (OpenID)',
  `access_token` VARCHAR(255) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `nickname` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_uid` (`provider`, `provider_user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方登录关联表';

-- ----------------------------
-- 3. Categories Table (文章分类)
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(50) NOT NULL COMMENT '分类别名(URL友好)',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父分类ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章分类表';

-- ----------------------------
-- 4. Tags Table (文章标签)
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `slug` VARCHAR(50) NOT NULL COMMENT '标签别名',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签表';

-- ----------------------------
-- 5. Articles Table (文章表)
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `slug` VARCHAR(255) NOT NULL COMMENT 'URL别名',
  `content` LONGTEXT NOT NULL COMMENT '文章内容(Markdown)',
  `html_content` LONGTEXT DEFAULT NULL COMMENT '渲染后的HTML(可选缓存)',
  `summary` TEXT DEFAULT NULL COMMENT '文章摘要',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `author_id` BIGINT UNSIGNED NOT NULL COMMENT '作者ID',
  `category_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '分类ID',
  `status` ENUM('draft', 'published', 'scheduled', 'hidden') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `visibility` ENUM('public', 'private', 'vip', 'paid', 'password') NOT NULL DEFAULT 'public' COMMENT '可见性',
  `password` VARCHAR(50) DEFAULT NULL COMMENT '访问密码(当visibility=password)',
  `price` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '单篇价格(当visibility=paid)',
  `is_top` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `allow_comment` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否允许评论',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览量',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论数',
  `word_count` INT UNSIGNED DEFAULT 0 COMMENT '字数统计',
  `reading_time` INT UNSIGNED DEFAULT 0 COMMENT '预计阅读时间(分钟)',
  `score` DOUBLE DEFAULT 0 COMMENT '综合热度分',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status_published` (`status`, `published_at`),
  KEY `idx_score` (`score`),
  FULLTEXT KEY `ft_title_content` (`title`, `content`),
  CONSTRAINT `fk_article_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_article_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章主表';

-- ----------------------------
-- 6. Article Tags Relation (文章-标签关联)
-- ----------------------------
DROP TABLE IF EXISTS `article_tags`;
CREATE TABLE `article_tags` (
  `article_id` BIGINT UNSIGNED NOT NULL,
  `tag_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_at_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_at_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章-标签关联表';

-- ----------------------------
-- 6.5. Article Likes (文章点赞)
-- ----------------------------
DROP TABLE IF EXISTS `article_likes`;
CREATE TABLE `article_likes` (
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

-- ----------------------------
-- 7. Comments Table (评论表)
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `article_id` BIGINT UNSIGNED NOT NULL COMMENT '文章ID',
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '用户ID(未登录则为NULL)',
  `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父评论ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `guest_name` VARCHAR(50) DEFAULT NULL COMMENT '游客昵称',
  `guest_email` VARCHAR(100) DEFAULT NULL COMMENT '游客邮箱',
  `guest_website` VARCHAR(255) DEFAULT NULL COMMENT '游客网站',
  `status` ENUM('pending', 'approved', 'rejected', 'spam') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `is_admin_reply` TINYINT(1) DEFAULT 0 COMMENT '是否管理员回复',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(255) DEFAULT NULL COMMENT 'User Agent',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `fk_comment_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- ----------------------------
-- 8. Friend Links Table (友情链接)
-- ----------------------------
DROP TABLE IF EXISTS `friend_links`;
CREATE TABLE `friend_links` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '网站名称',
  `url` VARCHAR(255) NOT NULL COMMENT '网站链接',
  `logo` VARCHAR(255) DEFAULT NULL COMMENT 'Logo链接',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '站长邮箱',
  `status` ENUM('active', 'hidden', 'pending') NOT NULL DEFAULT 'active' COMMENT '状态',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友情链接表';

-- ----------------------------
-- 9. Attachments Table (附件/图床)
-- ----------------------------
DROP TABLE IF EXISTS `attachments`;
CREATE TABLE `attachments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '上传者ID',
  `original_name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `filename` VARCHAR(255) NOT NULL COMMENT '存储文件名',
  `file_path` VARCHAR(255) DEFAULT NULL COMMENT '本地存储路径',
  `file_url` VARCHAR(255) NOT NULL COMMENT '访问URL',
  `file_type` VARCHAR(50) DEFAULT NULL COMMENT 'MIME类型',
  `file_size` INT UNSIGNED NOT NULL COMMENT '文件大小(Bytes)',
  `storage_type` ENUM('local', 'oss', 's3', 'cos') NOT NULL DEFAULT 'local' COMMENT '存储类型',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='附件表';

-- ----------------------------
-- 10. System Configs (系统配置)
-- ----------------------------
DROP TABLE IF EXISTS `system_configs`;
CREATE TABLE `system_configs` (
  `key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `value` TEXT DEFAULT NULL COMMENT '配置值',
  `type` VARCHAR(20) DEFAULT 'string' COMMENT '数据类型: string, number, boolean, json',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '配置说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- ----------------------------
-- 11. Operation Logs (操作日志)
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作用户ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作动作 (如: delete_article)',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '操作描述',
  `method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  `path` VARCHAR(255) DEFAULT NULL COMMENT '请求路径',
  `params` TEXT DEFAULT NULL COMMENT '请求参数(JSON)',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(255) DEFAULT NULL COMMENT 'User Agent',
  `status` INT DEFAULT 200 COMMENT '响应状态码',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- ----------------------------
-- 12. Webhooks
-- ----------------------------
DROP TABLE IF EXISTS `webhooks`;
CREATE TABLE `webhooks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event` VARCHAR(50) NOT NULL COMMENT '触发事件 (如: article.publish)',
  `target_url` VARCHAR(255) NOT NULL COMMENT '目标URL',
  `secret` VARCHAR(100) DEFAULT NULL COMMENT '签名密钥',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Webhook配置表';

-- ----------------------------
-- 13. Subscribers (邮件订阅)
-- ----------------------------
DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL COMMENT '订阅邮箱',
  `is_verified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否验证',
  `unsubscribe_token` VARCHAR(100) DEFAULT NULL COMMENT '退订Token',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件订阅者';

-- ----------------------------
-- 14. Products & Orders (付费体系)
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
  `original_price` DECIMAL(10, 2) DEFAULT NULL COMMENT '原价',
  `type` ENUM('vip_monthly', 'vip_yearly', 'vip_lifetime', 'article') NOT NULL COMMENT '商品类型',
  `related_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联ID (如文章ID)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `product_id` BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '实际支付金额',
  `status` ENUM('pending', 'paid', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `payment_method` ENUM('alipay', 'wechat', 'paypal', 'balance') DEFAULT NULL COMMENT '支付方式',
  `transaction_id` VARCHAR(100) DEFAULT NULL COMMENT '第三方交易号',
  `paid_at` DATETIME DEFAULT NULL COMMENT '支付时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- ----------------------------
-- 15. Statistics (数据统计缓存 - 可选)
-- ----------------------------
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE `statistics` (
  `date` DATE NOT NULL COMMENT '统计日期',
  `pv` INT UNSIGNED DEFAULT 0 COMMENT '浏览量',
  `uv` INT UNSIGNED DEFAULT 0 COMMENT '独立访客',
  `article_views` INT UNSIGNED DEFAULT 0 COMMENT '文章阅读数',
  `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '新增评论数',
  PRIMARY KEY (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日数据统计';

-- ----------------------------
-- 16. Dead Links Table (死链检测结果表)
-- ----------------------------
DROP TABLE IF EXISTS `dead_links`;
CREATE TABLE `dead_links` (
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

-- ----------------------------
-- 17. Announcements (系统公告)
-- ----------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `type` ENUM('general', 'system_update', 'maintenance', 'important') NOT NULL DEFAULT 'general' COMMENT '公告类型',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否置顶展示',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统公告表';

-- 初始数据
INSERT INTO `announcements` (`title`, `content`, `type`, `is_active`) VALUES 
('系统上线公告', '欢迎来到我的个人博客系统！这是我们的第一次见面。', 'important', 1),
('版本更新 v1.0.1', '1. 修复了目录跳转逻辑\n2. 优化了个人信息设置界面\n3. 新增了系统公告功能', 'system_update', 1);

SET FOREIGN_KEY_CHECKS = 1;