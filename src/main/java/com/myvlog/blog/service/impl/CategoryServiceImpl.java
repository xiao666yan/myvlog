package com.myvlog.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.myvlog.blog.dto.CategoryDto;
import com.myvlog.blog.entity.Category;
import com.myvlog.blog.mapper.CategoryMapper;
import com.myvlog.blog.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        Category category = new Category();
        BeanUtils.copyProperties(categoryDto, category);
        
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(UUID.randomUUID().toString().substring(0, 8));
        }
        
        // Check duplicate slug
        if (categoryMapper.selectCount(new LambdaQueryWrapper<Category>().eq(Category::getSlug, category.getSlug())) > 0) {
            throw new RuntimeException("Category slug already exists");
        }

        categoryMapper.insert(category);
        
        CategoryDto result = new CategoryDto();
        BeanUtils.copyProperties(category, result);
        return result;
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new RuntimeException("Category not found");
        }

        BeanUtils.copyProperties(categoryDto, category, "id", "createdAt", "updatedAt");
        categoryMapper.updateById(category);
        
        CategoryDto result = new CategoryDto();
        BeanUtils.copyProperties(category, result);
        return result;
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryMapper.deleteById(id);
    }

    @Override
    public CategoryDto getCategory(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            return null;
        }
        CategoryDto result = new CategoryDto();
        BeanUtils.copyProperties(category, result);
        return result;
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryMapper.selectList(new LambdaQueryWrapper<Category>().orderByAsc(Category::getSortOrder))
                .stream()
                .map(category -> {
                    CategoryDto dto = new CategoryDto();
                    BeanUtils.copyProperties(category, dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
