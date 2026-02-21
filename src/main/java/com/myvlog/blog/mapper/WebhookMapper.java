package com.myvlog.blog.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.myvlog.blog.entity.Webhook;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface WebhookMapper extends BaseMapper<Webhook> {
}
