USE myvlog;
ALTER TABLE `system_configs` CHANGE COLUMN `key` `config_key` VARCHAR(100) NOT NULL COMMENT '配置键';
