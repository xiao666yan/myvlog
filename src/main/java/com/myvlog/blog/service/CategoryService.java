package com.myvlog.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.myvlog.blog.dto.CategoryDto;
import com.myvlog.blog.entity.Category;
import java.util.List;

public interface CategoryService extends IService<Category> {
    CategoryDto createCategory(CategoryDto categoryDto);
    CategoryDto updateCategory(Long id, CategoryDto categoryDto);
    void deleteCategory(Long id);
    CategoryDto getCategory(Long id);
    List<CategoryDto> getAllCategories();
}
