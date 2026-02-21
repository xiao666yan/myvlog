package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.entity.Project;

import java.util.List;

public interface ProjectService extends IService<Project> {
    List<Project> getUserProjects(Long userId);
}
