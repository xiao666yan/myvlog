package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("`columns`")
public class Column extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String slug;

    private String description;

    private String coverImage;

    private Long parentId;

    private Integer sortOrder;

    private Integer status;
}
