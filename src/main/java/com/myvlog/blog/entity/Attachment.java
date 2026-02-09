package com.myvlog.blog.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("attachments")
public class Attachment extends BaseEntity {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String originalName;

    private String filename;

    private String filePath;

    private String fileUrl;

    private String fileType;

    private Long fileSize;

    // storage_type: local, oss, s3, cos
    private String storageType;
}
