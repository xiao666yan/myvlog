package com.myvlog.blog.config;

import com.myvlog.blog.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 安全配置类
 * 用于配置 HTTP 安全、认证管理器、加密方式以及跨域策略
 */
@Configuration
@EnableWebSecurity // 启用 Spring Security Web 安全支持
@EnableMethodSecurity // 启用方法级别的权限控制 (如 @PreAuthorize)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter; // 自定义的 JWT 过滤器
    private final UserDetailsService userDetailsService; // 用户详情服务实现类

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("DEBUG: Configuring SecurityFilterChain");
        http
                // 1. 禁用 CSRF (跨站请求伪造) 保护，因为我们使用 JWT (无状态)
                .csrf(AbstractHttpConfigurer::disable)
                // 2. 启用跨域支持
                .cors(Customizer.withDefaults())
                // 3. 配置请求的授权规则
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/announcements/active").permitAll() // 开放公告接口 (移动到最前)
                        .requestMatchers("/api/auth/**").permitAll() // 开放登录注册接口
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/articles/**").permitAll() // 开放文章浏览 (仅限 GET)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/tags/**").permitAll()
                        .requestMatchers("/api/dashboard/**").permitAll() // 仪表盘统计接口 (内部有逻辑处理权限)
                        .requestMatchers("/uploads/**").permitAll() // 开放图片等静态资源上传目录
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // 放行所有 OPTIONS 预检请求
                        .anyRequest().authenticated() // 其他所有请求都需要身份认证
                )
                // 4. 配置会话管理策略为无状态 (Stateless)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // 5. 配置身份验证提供者
                .authenticationProvider(authenticationProvider())
                // 6. 将 JWT 过滤器放在用户名密码过滤器之前
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 配置跨域资源共享 (CORS)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); // 允许所有来源
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // 允许的 HTTP 方法
        configuration.setAllowedHeaders(List.of("*")); // 允许所有请求头
        configuration.setAllowCredentials(true); // 允许携带 Cookie/凭证
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 对所有路径生效
        return source;
    }

    /**
     * 配置认证提供者，关联 UserDetailsService 和密码加密器
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * 配置认证管理器，用于处理认证请求
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 配置密码加密器，使用 BCrypt 强哈希算法
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
