package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.SystemConfig;

import java.util.Map;

public interface SystemConfigService extends IService<SystemConfig> {
    
    /**
     * Get all configs as a map (key -> value)
     */
    Map<String, String> getAllConfigs();

    /**
     * Get a specific config value
     */
    String getConfigValue(String key);
    
    /**
     * Update multiple configs
     */
    void updateConfigs(Map<String, String> configs);
    
    /**
     * Initialize default configs if not present
     */
    void initDefaultConfigs();
}
