package com.myvlog.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myvlog.blog.entity.Column;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ColumnMapper extends BaseMapper<Column> {

    @Select("SELECT * FROM `columns` WHERE status = 1 ORDER BY sort_order ASC, created_at ASC")
    List<Column> selectAllActive();

    @Select("SELECT * FROM `columns` WHERE parent_id = #{parentId} AND status = 1 ORDER BY sort_order ASC")
    List<Column> selectByParentId(@Param("parentId") Long parentId);
}
