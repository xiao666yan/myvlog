package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("announcements")
public class Announcement extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    /**
     * type: general, system_update, maintenance, important
     */
    private String type;

    @TableField("is_active")
    private Boolean isActive;
}
