package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.entity.Project;
import com.myvlog.blog.mapper.ProjectMapper;
import com.myvlog.blog.service.ProjectService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements ProjectService {

    @Override
    public List<Project> getUserProjects(Long userId) {
        return list(new LambdaQueryWrapper<Project>()
                .eq(Project::getUserId, userId)
                .orderByDesc(Project::getCreatedAt));
    }
}
