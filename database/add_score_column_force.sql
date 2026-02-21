USE myvlog;
ALTER TABLE `articles` ADD COLUMN `score` DOUBLE DEFAULT 0 COMMENT '综合热度分';
CREATE INDEX `idx_score` ON `articles`(`score`);
