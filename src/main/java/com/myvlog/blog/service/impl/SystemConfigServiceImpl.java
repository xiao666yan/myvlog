package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.SystemConfig;
import com.myvlog.blog.mapper.SystemConfigMapper;
import com.myvlog.blog.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl extends ServiceImpl<SystemConfigMapper, SystemConfig> implements SystemConfigService {

    @Override
    public Map<String, String> getAllConfigs() {
        List<SystemConfig> list = list();
        return list.stream().collect(Collectors.toMap(SystemConfig::getKey, SystemConfig::getValue));
    }

    @Override
    public String getConfigValue(String key) {
        SystemConfig config = getById(key);
        return config != null ? config.getValue() : null;
    }

    @Override
    @Transactional
    public void updateConfigs(Map<String, String> configs) {
        if (configs == null || configs.isEmpty()) {
            return;
        }
        
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            
            SystemConfig config = getById(key);
            if (config == null) {
                config = new SystemConfig();
                config.setKey(key);
                config.setValue(value);
                config.setType("string"); // Default to string
                save(config);
            } else {
                config.setValue(value);
                updateById(config);
            }
        }
    }

    @Override
    @Transactional
    public void initDefaultConfigs() {
        Map<String, String> defaults = new HashMap<>();
        defaults.put("site_title", "CodeCanvas");
        defaults.put("site_description", "A simple vlog system");
        defaults.put("site_keywords", "vlog, blog, java, spring boot");
        defaults.put("site_logo", "");
        defaults.put("site_favicon", "");
        defaults.put("site_footer", "© 2026 CodeCanvas. All rights reserved.");
        defaults.put("site_announcement", "Welcome to CodeCanvas!");
        defaults.put("allow_register", "true");
        defaults.put("allow_comment", "true");
        defaults.put("icp_record", "");
        defaults.put("police_record", "");

        for (Map.Entry<String, String> entry : defaults.entrySet()) {
            if (getById(entry.getKey()) == null) {
                SystemConfig config = new SystemConfig();
                config.setKey(entry.getKey());
                config.setValue(entry.getValue());
                config.setType("string");
                config.setDescription("Default config");
                save(config);
            }
        }
    }
}
