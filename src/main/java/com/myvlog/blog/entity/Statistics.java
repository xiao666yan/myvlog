package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;

@Data
@TableName("statistics")
public class Statistics {
    @TableId
    private LocalDate date;

    private Integer pv;

    private Integer uv;

    private Integer articleViews;

    private Integer commentCount;
}
