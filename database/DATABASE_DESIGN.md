# 个人博客数据库设计文档

本文档详细描述了个人博客系统的数据库设计方案及已实现的功能。该设计旨在满足用户注册登录、文章发布、评论互动、后台管理、SEO优化以及付费阅读和会员体系等全方位需求。

## 1. 设计概览

*   **数据库类型**: MySQL 8.0+ / PostgreSQL 12+ (本设计提供 MySQL 兼容脚本)
*   **字符集**: utf8mb4 (支持 Emoji 表情)
*   **核心模块**:
    *   用户与权限 (Users, Roles) - **已实现** (注册/登录/JWT/VIP)
    *   内容管理 (Articles, Categories, Tags) - **已实现** (Markdown/搜索/热度分)
    *   互动模块 (Comments, ArticleLikes) - **已实现** (评论/点赞/树形回复)
    *   系统配置 (SystemConfigs, FriendLinks, Webhooks) - **已实现** (动态配置/Webhook)
    *   运营与日志 (OperationLogs, Attachments, Subscribers, DeadLinks) - **已实现** (审计/上传/订阅/死链检测)
    *   商城与支付 (Orders, Products) - **已实现** (模拟支付/VIP购买)
    *   其他 (AI接口预留, 数据备份) - **已实现**

## 2. 详细表结构与需求映射

### 2.1 用户与会员体系
**需求**: 用户注册登录、第三方登录、会员功能。

*   **表**: `users`
*   **关键字段**:
    *   `username`, `email`, `password_hash`: 基础认证信息。
    *   `role`: 枚举值 `user`, `admin`, `vip`。简单的角色控制。
    *   `vip_expire_at`: 会员过期时间，支持按月/年订阅。
    *   `provider`, `provider_id`: 用于存储第三方登录信息 (如 GitHub, Google)。
    *   `status`: `active` 或 `banned`，用于封禁用户。
    *   `preferences`: 用户偏好设置 (JSON).

### 2.2 文章内容管理 (CMS)
**需求**: Markdown文章、分页、分类、标签、字数、阅读时间、点击量、归档、付费/会员观看。

*   **表**: `articles`, `categories`, `tags`, `article_tags`
*   **关键字段 (articles)**:
    *   `content`: 存储 Markdown 源码。
    *   `html_content`: 存储渲染后的 HTML。
    *   `slug`: URL 友好的标识符。
    *   `status`: `draft` (草稿), `published` (发布), `scheduled` (定时), `hidden` (隐藏)。
    *   `visibility`: `public`, `vip`, `paid`, `password`.
    *   `price`: 单篇付费价格。
    *   `view_count`: 点击量 (原子更新)。
    *   `score`: 综合热度分 (基于浏览、点赞、评论及时间衰减计算)。
    *   `published_at`: 用于定时发布和归档排序。
*   **归档 (Archives)**: 通过 `published_at` 字段按年月 `GROUP BY` 查询即可实现。
*   **分类与标签**: 标准的多对一 (Category) 和多对多 (Tags) 关系。

### 2.3 评论与互动
**需求**: 用户评论、评论审核、文章热度。

*   **表**: `comments`
*   **关键字段**:
    *   `article_id`, `user_id`: 关联文章和用户。
    *   `parent_id`: 支持嵌套回复 (盖楼)。
    *   `status`: `pending`, `approved`, `spam`.
    *   `is_admin`: 标记博主回复。
*   **表**: `article_likes`
    *   记录用户点赞信息，防止重复点赞。

### 2.4 系统管理与配置
**需求**: 后台管理、系统配置中心、友情链接、SEO。

*   **表**: `system_configs`
    *   Key-Value 结构，动态存储配置。
*   **表**: `friend_links`
    *   管理友链。
*   **表**: `operation_logs`
    *   记录后台敏感操作（删除、修改配置等）。

### 2.5 运营与扩展
**需求**: 邮件订阅、图床、Webhook、死链检测。

*   **表**: `subscribers`: 邮件订阅列表。
*   **表**: `attachments`: 文件上传记录 (本地/OSS)。
*   **表**: `webhooks`: 文章发布回调。
*   **表**: `dead_links`: 死链检测结果。

### 2.6 付费与订单
**需求**: 部分文章付费观看、会员订阅。

*   **表**: `orders`
    *   `order_no`: 唯一订单号。
    *   `product_type`: `vip` 或 `article`.
    *   `status`: `pending`, `paid`, `cancelled`.
    *   `payment_method`: 支付方式记录。

## 3. SEO 优化支持
*   **Sitemap**: 通过查询 `articles` (where status='published') 生成。
*   **Robots.txt**: 静态文件，或通过 `system_configs` 动态生成。
*   **Meta信息**: `articles` 表包含 `summary` (description) 和 `tags` (keywords)。
*   **Slug**: 所有内容表 (`articles`, `categories`, `tags`) 均包含 `slug` 字段。

## 4. API 接口示例 (Current Implementation)

以下是后端已实现的 API 接口示例，所有接口均以 `/api` 开头。

### 4.1 认证 (Auth)
*   **注册**: `POST /api/auth/register`
    ```json
    {
      "username": "testuser",
      "email": "test@example.com",
      "password": "password123"
    }
    ```
*   **登录**: `POST /api/auth/login`
    ```json
    {
      "username": "testuser",
      "password": "password123"
    }
    ```

### 4.2 文章 (Articles)
*   **列表**: `GET /api/articles?page=1&size=10&sort=newest`
*   **详情**: `GET /api/articles/{id}` (自动增加浏览量)
*   **创建**: `POST /api/articles` (Admin only)
    ```json
    {
      "title": "My New Post",
      "content": "# Hello World",
      "categoryId": 1,
      "tagIds": [1, 2],
      "status": "published",
      "visibility": "public"
    }
    ```
*   **搜索**: `GET /api/search?q=keyword`
*   **点赞**: `POST /api/articles/{id}/like`
*   **取消点赞**: `DELETE /api/articles/{id}/like`

### 4.3 评论 (Comments)
*   **发表评论**: `POST /api/comments`
    ```json
    {
      "articleId": 1,
      "content": "Nice post!",
      "parentId": null
    }
    ```
*   **文章评论列表**: `GET /api/comments/article/{articleId}` (树形结构)

### 4.4 系统配置 (System Config)
*   **获取所有配置**: `GET /api/admin/configs`
*   **更新配置**: `POST /api/admin/configs`
    ```json
    {
      "site_title": "My Awesome Blog",
      "allow_comment": "true"
    }
    ```

### 4.5 其他功能
*   **文件上传**: `POST /api/upload` (form-data: file) -> 返回 `{"url": "/uploads/..."}`
*   **死链检测**: `POST /api/admin/dead-links/scan` (触发扫描)
*   **数据备份导出**: `GET /api/admin/backups/export` (下载 SQL 文件)
*   **AI 摘要生成**: `POST /api/ai/summary` -> `{"summary": "..."}`
*   **邮件订阅**: `POST /api/subscribe` -> `{"email": "..."}`
*   **VIP 购买模拟**: `POST /api/orders/create?productId=1` -> `POST /api/orders/{id}/pay`
