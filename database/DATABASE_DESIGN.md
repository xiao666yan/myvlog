# 个人博客数据库设计文档

本文档详细描述了个人博客系统的数据库设计方案及已实现的功能。该设计旨在满足用户注册登录、文章发布、评论互动、后台管理、SEO优化以及付费阅读和会员体系等全方位需求。

## 1. 设计概览

*   **数据库类型**: MySQL 8.0+
*   **字符集**: utf8mb4 (支持 Emoji 表情)
*   **ORM框架**: MyBatis-Plus
*   **核心模块**:
    *   用户与权限 (Users, SocialAccounts) - **已实现** (注册/登录/JWT/VIP/第三方登录)
    *   内容管理 (Articles, Categories, Tags) - **已实现** (Markdown/搜索/热度分)
    *   互动模块 (Comments, ArticleLikes) - **已实现** (评论/点赞/树形回复)
    *   系统配置 (SystemConfigs, FriendLinks, Webhooks, Announcements) - **已实现** (动态配置/Webhook/公告)
    *   运营与日志 (OperationLogs, Attachments, Subscribers, DeadLinks, Statistics) - **已实现** (审计/上传/订阅/死链检测/统计)
    *   商城与支付 (Orders, Products) - **已实现** (模拟支付/VIP购买)
    *   项目展示 (Projects) - **已实现**
    *   其他 (AI接口预留, 数据备份) - **已实现**

## 2. 详细表结构与需求映射

### 2.1 用户与会员体系
**需求**: 用户注册登录、第三方登录、会员功能。

#### 2.1.1 `users` 用户表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱，唯一 |
| password_hash | VARCHAR(255) | 加密密码 |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像URL |
| bio | VARCHAR(255) | 个人简介 |
| role | ENUM('user', 'admin', 'vip') | 角色 |
| status | TINYINT(1) | 状态：1-正常，0-禁用 |
| vip_expire_at | DATETIME | 会员过期时间 |
| last_login_at | DATETIME | 最后登录时间 |
| last_login_ip | VARCHAR(45) | 最后登录IP |
| preferences | VARCHAR | 用户偏好设置(JSON) |
| created_at | DATETIME | 注册时间 |
| updated_at | DATETIME | 更新时间 |

#### 2.1.2 `social_accounts` 第三方登录表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| user_id | BIGINT UNSIGNED | 关联用户ID |
| provider | VARCHAR(50) | 提供商：github, google, wechat |
| provider_user_id | VARCHAR(100) | 第三方用户ID |
| access_token | VARCHAR(255) | 访问令牌 |
| avatar | VARCHAR(255) | 头像 |
| nickname | VARCHAR(100) | 昵称 |

### 2.2 文章内容管理 (CMS)
**需求**: Markdown文章、分页、分类、标签、字数、阅读时间、点击量、归档、付费/会员观看。

#### 2.2.1 `articles` 文章表（核心表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| title | VARCHAR(255) | 文章标题 |
| slug | VARCHAR(255) | URL别名，唯一 |
| content | LONGTEXT | 文章内容(Markdown) |
| html_content | LONGTEXT | 渲染后的HTML |
| summary | TEXT | 文章摘要 |
| cover_image | VARCHAR(255) | 封面图片URL |
| author_id | BIGINT UNSIGNED | 作者ID |
| category_id | BIGINT UNSIGNED | 分类ID |
| status | ENUM | 状态：draft, published, scheduled, hidden |
| visibility | ENUM | 可见性：public, private, vip, paid, password |
| password | VARCHAR(50) | 访问密码 |
| price | DECIMAL(10,2) | 单篇价格 |
| is_top | TINYINT(1) | 是否置顶 |
| allow_comment | TINYINT(1) | 是否允许评论 |
| view_count | INT UNSIGNED | 浏览量 |
| like_count | INT UNSIGNED | 点赞数 |
| comment_count | INT UNSIGNED | 评论数 |
| word_count | INT UNSIGNED | 字数统计 |
| reading_time | INT UNSIGNED | 预计阅读时间(分钟) |
| score | DOUBLE | 综合热度分（基于浏览、点赞、评论及时间衰减计算） |
| published_at | DATETIME | 发布时间 |
| deleted_at | DATETIME | 软删除时间 |

#### 2.2.2 `categories` 分类表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| name | VARCHAR(50) | 分类名称 |
| slug | VARCHAR(50) | 分类别名(URL友好)，唯一 |
| description | VARCHAR(255) | 分类描述 |
| parent_id | BIGINT UNSIGNED | 父分类ID（支持层级） |
| sort_order | INT | 排序权重 |

#### 2.2.3 `tags` 标签表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| name | VARCHAR(50) | 标签名称，唯一 |
| slug | VARCHAR(50) | 标签别名，唯一 |

#### 2.2.4 `article_tags` 文章-标签关联表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| article_id | BIGINT UNSIGNED | 文章ID（联合主键） |
| tag_id | BIGINT UNSIGNED | 标签ID（联合主键） |

*   **归档 (Archives)**: 通过 `published_at` 字段按年月 `GROUP BY` 查询即可实现。
*   **分类与标签**: 标准的多对一 (Category) 和多对多 (Tags) 关系。

### 2.3 评论与互动
**需求**: 用户评论、评论审核、文章热度。

#### 2.3.1 `comments` 评论表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| article_id | BIGINT UNSIGNED | 文章ID |
| user_id | BIGINT UNSIGNED | 用户ID（游客为NULL） |
| parent_id | BIGINT UNSIGNED | 父评论ID（支持嵌套） |
| content | TEXT | 评论内容 |
| guest_name | VARCHAR(50) | 游客昵称 |
| guest_email | VARCHAR(100) | 游客邮箱 |
| guest_website | VARCHAR(255) | 游客网站 |
| status | ENUM | 状态：pending, approved, rejected, spam |
| is_admin_reply | TINYINT(1) | 是否管理员回复 |
| ip_address | VARCHAR(45) | IP地址 |
| user_agent | VARCHAR(255) | User Agent |

#### 2.3.2 `article_likes` 文章点赞表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| article_id | BIGINT UNSIGNED | 文章ID |
| user_id | BIGINT UNSIGNED | 用户ID |

### 2.4 系统管理与配置
**需求**: 后台管理、系统配置中心、友情链接、SEO、系统公告。

#### 2.4.1 `system_configs` 系统配置表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| key | VARCHAR(100) | 配置键（主键） |
| value | TEXT | 配置值 |
| type | VARCHAR(20) | 数据类型：string, number, boolean, json |
| description | VARCHAR(255) | 配置说明 |

#### 2.4.2 `friend_links` 友情链接表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| name | VARCHAR(50) | 网站名称 |
| url | VARCHAR(255) | 网站链接 |
| logo | VARCHAR(255) | Logo链接 |
| description | VARCHAR(255) | 描述 |
| email | VARCHAR(100) | 站长邮箱 |
| status | ENUM | 状态：active, hidden, pending |
| sort_order | INT | 排序 |

#### 2.4.3 `announcements` 系统公告表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| title | VARCHAR(255) | 公告标题 |
| content | TEXT | 公告内容 |
| type | ENUM | 类型：general, system_update, maintenance, important |
| is_active | TINYINT(1) | 是否置顶展示 |

#### 2.4.4 `operation_logs` 操作日志表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| user_id | BIGINT UNSIGNED | 操作用户ID |
| username | VARCHAR | 用户名 |
| module | VARCHAR | 模块名 |
| action | VARCHAR(50) | 操作动作 |
| description | VARCHAR(255) | 操作描述 |
| method | VARCHAR(10) | 请求方法 |
| params | TEXT | 请求参数(JSON) |
| ip_address | VARCHAR(45) | IP地址 |
| user_agent | VARCHAR(255) | User Agent |
| execution_time | LONG | 执行时间 |

### 2.5 运营与扩展
**需求**: 邮件订阅、图床、Webhook、死链检测、数据统计。

#### 2.5.1 `subscribers` 邮件订阅表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| email | VARCHAR(100) | 订阅邮箱，唯一 |
| is_verified | TINYINT(1) | 是否验证 |
| unsubscribe_token | VARCHAR(100) | 退订Token |

#### 2.5.2 `attachments` 附件表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| user_id | BIGINT UNSIGNED | 上传者ID |
| original_name | VARCHAR(255) | 原始文件名 |
| filename | VARCHAR(255) | 存储文件名 |
| file_path | VARCHAR(255) | 本地存储路径 |
| file_url | VARCHAR(255) | 访问URL |
| file_type | VARCHAR(50) | MIME类型 |
| file_size | BIGINT UNSIGNED | 文件大小 |
| storage_type | ENUM | 存储类型：local, oss, s3, cos |

#### 2.5.3 `webhooks` Webhook配置表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| event | VARCHAR(50) | 触发事件 |
| target_url | VARCHAR(255) | 目标URL |
| secret | VARCHAR(100) | 签名密钥 |
| is_active | TINYINT(1) | 是否激活 |

#### 2.5.4 `dead_links` 死链检测结果表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| url | VARCHAR(2048) | 失效链接URL |
| status_code | INT | HTTP状态码 |
| error_message | TEXT | 错误信息 |
| source_type | VARCHAR(20) | 来源类型：ARTICLE, COMMENT |
| source_id | BIGINT UNSIGNED | 来源ID |

#### 2.5.5 `statistics` 每日数据统计表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| date | DATE | 统计日期（主键） |
| pv | INT UNSIGNED | 浏览量 |
| uv | INT UNSIGNED | 独立访客 |
| article_views | INT UNSIGNED | 文章阅读数 |
| comment_count | INT UNSIGNED | 新增评论数 |

### 2.6 付费与订单
**需求**: 部分文章付费观看、会员订阅。

#### 2.6.1 `products` 商品表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| name | VARCHAR(100) | 商品名称 |
| description | TEXT | 商品描述 |
| price | DECIMAL(10,2) | 价格 |
| original_price | DECIMAL(10,2) | 原价 |
| type | ENUM | 类型：vip_monthly, vip_yearly, vip_lifetime, article |
| related_id | BIGINT UNSIGNED | 关联ID |
| is_active | TINYINT(1) | 是否激活 |

#### 2.6.2 `orders` 订单表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| order_no | VARCHAR(64) | 订单号，唯一 |
| user_id | BIGINT UNSIGNED | 用户ID |
| product_id | BIGINT UNSIGNED | 商品ID |
| amount | DECIMAL(10,2) | 实际支付金额 |
| status | ENUM | 状态：pending, paid, cancelled, refunded |
| payment_method | ENUM | 支付方式：alipay, wechat, paypal, balance |
| transaction_id | VARCHAR(100) | 第三方交易号 |
| paid_at | DATETIME | 支付时间 |

### 2.7 项目展示
**需求**: 展示个人项目作品。

#### 2.7.1 `projects` 项目表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | BIGINT UNSIGNED | 主键ID |
| user_id | BIGINT UNSIGNED | 用户ID |
| title | VARCHAR | 项目标题 |
| description | VARCHAR | 项目描述 |
| url | VARCHAR | 项目链接 |
| cover_image | VARCHAR | 封面图片 |
| status | VARCHAR | 状态：active, archived |

## 3. 数据库表关系图

```
users (用户)
  ├── 1:N → articles (文章)
  ├── 1:N → comments (评论)
  ├── 1:N → attachments (附件)
  ├── 1:N → orders (订单)
  ├── 1:N → operation_logs (操作日志)
  ├── 1:N → projects (项目)
  └── 1:N → social_accounts (第三方登录)

articles (文章)
  ├── N:1 → categories (分类)
  ├── N:M → tags (标签) [通过 article_tags]
  ├── 1:N → comments (评论)
  └── 1:N → article_likes (点赞)

products (商品)
  └── 1:N → orders (订单)
```

## 4. SEO 优化支持
*   **Sitemap**: 通过查询 `articles` (where status='published') 生成。
*   **Robots.txt**: 静态文件，或通过 `system_configs` 动态生成。
*   **Meta信息**: `articles` 表包含 `summary` (description) 和 `tags` (keywords)。
*   **Slug**: 所有内容表 (`articles`, `categories`, `tags`) 均包含 `slug` 字段。

## 5. API 接口示例 (Current Implementation)

以下是后端已实现的 API 接口，所有接口均以 `/api` 开头。

### 5.1 认证 (Auth)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |

**注册示例**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**登录示例**:
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### 5.2 用户 (Users)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/profile` | GET | 获取个人信息 |
| `/api/users` | GET | 获取用户列表 |
| `/api/users/{id}/nickname` | PUT | 更新昵称 |
| `/api/users/{id}/profile` | PUT | 更新个人资料 |
| `/api/users/{id}/email` | PUT | 更新邮箱 |
| `/api/users/{id}/avatar` | PUT | 更新头像 |
| `/api/users/{id}/password` | PUT | 修改密码 |
| `/api/users/{id}/vip` | POST | 授予VIP（管理员） |
| `/api/users/{id}` | DELETE | 删除用户（管理员） |

### 5.3 文章 (Articles)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/articles` | GET | 获取文章列表 |
| `/api/articles/{id}` | GET | 获取文章详情（自动增加浏览量） |
| `/api/articles/slug/{slug}` | GET | 通过Slug获取文章 |
| `/api/articles/me` | GET | 获取我的文章 |
| `/api/articles` | POST | 创建文章（管理员） |
| `/api/articles/{id}` | PUT | 更新文章 |
| `/api/articles/{id}` | DELETE | 删除文章 |
| `/api/articles/{id}/like` | POST | 点赞文章 |
| `/api/articles/{id}/like` | DELETE | 取消点赞 |
| `/api/articles/{id}/like` | GET | 获取点赞状态 |
| `/api/articles/admin` | GET | 管理员文章列表 |
| `/api/articles/{id}/audit` | PUT | 审核文章 |

**创建文章示例**:
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

### 5.4 分类 (Categories)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取所有分类 |
| `/api/categories/{id}` | GET | 获取单个分类 |
| `/api/categories` | POST | 创建分类（管理员） |
| `/api/categories/{id}` | PUT | 更新分类（管理员） |
| `/api/categories/{id}` | DELETE | 删除分类（管理员） |

### 5.5 标签 (Tags)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tags` | GET | 获取所有标签 |
| `/api/tags` | POST | 创建标签（管理员） |
| `/api/tags/{id}` | PUT | 更新标签（管理员） |
| `/api/tags/{id}` | DELETE | 删除标签（管理员） |

### 5.6 评论 (Comments)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/comments/article/{articleId}` | GET | 获取文章评论（树形结构） |
| `/api/comments` | POST | 发表评论 |
| `/api/comments/admin` | GET | 管理员评论列表 |
| `/api/comments/{id}` | DELETE | 删除评论 |
| `/api/comments/{id}/audit` | PUT | 审核评论（管理员） |

**发表评论示例**:
```json
{
  "articleId": 1,
  "content": "Nice post!",
  "parentId": null
}
```

### 5.7 搜索 (Search)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/search` | GET | 搜索文章 |

### 5.8 系统配置 (System Config)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/configs` | GET | 获取所有配置 |
| `/api/configs` | POST | 更新配置（管理员） |

**更新配置示例**:
```json
{
  "site_title": "My Awesome Blog",
  "allow_comment": "true"
}
```

### 5.9 公告 (Announcements)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/announcements/active` | GET | 获取活跃公告 |
| `/api/announcements` | GET | 获取所有公告（管理员） |
| `/api/announcements` | POST | 创建公告（管理员） |
| `/api/announcements/{id}` | PUT | 更新公告（管理员） |
| `/api/announcements/{id}` | DELETE | 删除公告（管理员） |

### 5.10 订单 (Orders)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/orders/create` | POST | 创建订单 |
| `/api/orders/{id}/pay` | POST | 支付订单（模拟） |

### 5.11 仪表盘 (Dashboard)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/dashboard/stats` | GET | 获取统计数据 |
| `/api/dashboard/heat` | GET | 获取热度排行（管理员） |

### 5.12 文件上传 (Upload)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/upload` | POST | 上传文件 (form-data: file) -> 返回 `{"url": "/uploads/..."}` |

### 5.13 AI 功能
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/ai/summary` | POST | AI生成摘要 -> `{"summary": "..."}` |
| `/api/ai/title` | POST | AI生成标题建议 |

### 5.14 邮件订阅 (Subscribe)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/subscribe` | POST | 订阅邮件 -> `{"email": "..."}` |
| `/api/subscribe/unsubscribe` | GET | 取消订阅 |

### 5.15 死链检测 (Dead Links)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/dead-links` | GET | 获取死链列表 |
| `/api/admin/dead-links/scan` | POST | 触发扫描 |
| `/api/admin/dead-links/{id}` | DELETE | 删除死链记录 |

### 5.16 Webhook
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/webhooks` | GET | 获取Webhook列表 |
| `/api/admin/webhooks` | POST | 创建Webhook |
| `/api/admin/webhooks/{id}` | DELETE | 删除Webhook |

### 5.17 数据备份 (Backup)
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/admin/backups/export` | GET | 导出数据备份（下载 SQL 文件） |

## 6. 关键技术特性

### 6.1 技术栈
*   **后端框架**: Spring Boot
*   **ORM框架**: MyBatis-Plus
*   **安全框架**: Spring Security
*   **认证方式**: JWT (有效期24小时)

### 6.2 自定义注解
*   **@RateLimit**: 接口限流注解
*   **@Log**: 操作日志注解 + AOP

### 6.3 定时任务
| 任务名 | 说明 |
|--------|------|
| ArticleScoreTask | 文章热度分计算 |
| ArticlePublishTask | 定时发布任务 |
| LinkHealthCheckTask | 死链检测 |
| BackupTask | 数据备份 |

## 7. 数据库配置

配置文件位置: `src/main/resources/application.yml`

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/myvlog?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: 123456

mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.myvlog.blog.entity
  configuration:
    map-underscore-to-camel-case: true
```
