package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("system_configs")
public class SystemConfig extends BaseEntity {
    @TableId(type = IdType.INPUT, value = "`key`")
    private String key;

    private String value;

    private String type;

    private String description;
}
