package com.myvlog.blog.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String bio;
    private String email;
    private String role;
    private Integer status;
    private String preferences;
}
