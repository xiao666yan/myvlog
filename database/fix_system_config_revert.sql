USE myvlog;

-- Revert system_configs table to use `key` instead of `config_key`
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

-- Ensure articles table has score column
DROP PROCEDURE IF EXISTS AddScoreColumn;
DELIMITER //
CREATE PROCEDURE AddScoreColumn()
BEGIN
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = 'myvlog' 
        AND TABLE_NAME = 'articles' 
        AND COLUMN_NAME = 'score'
    ) THEN
        ALTER TABLE `articles` ADD COLUMN `score` DOUBLE DEFAULT 0 COMMENT '综合热度分';
        CREATE INDEX `idx_score` ON `articles`(`score`);
    END IF;
END //
DELIMITER ;
CALL AddScoreColumn();
DROP PROCEDURE AddScoreColumn;
