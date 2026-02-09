# MyVlog - 个人博客系统

一个基于 Spring Boot + Vue 3 + MySQL 开发的现代化个人博客系统。

## 项目特点
- **前后端分离**: 后端使用 Spring Boot 3.x，前端使用 Vue 3 + Vite。
- **功能丰富**: 包含文章发布、分类管理、标签系统、朋友圈（随笔）、后台管理仪表盘、深色模式切换等。
- **部署便捷**: 支持 Docker & Docker Compose 一键部署。
- **响应式设计**: 适配桌面端与移动端。

## 技术栈
- **后端**: Java 17, Spring Boot, MyBatis Plus, MySQL 8.0
- **前端**: Vue 3, Vue Router, Axios, Vite, ECharts
- **部署**: Docker, Nginx

## 快速开始

### 1. 数据库配置
在 `src/main/resources/application.yml` 中配置你的 MySQL 连接信息。

### 2. 运行后端
```bash
mvn spring-boot:run
```

### 3. 运行前端
```bash
cd frontend
npm install
npm run dev
```

## 部署方案
项目包含完整的 Docker 部署配置文件：
- `Dockerfile`: 后端镜像构建
- `docker-compose.yml`: 一键启动脚本（MySQL + Backend + Nginx）
- `nginx/conf.d/default.conf`: Nginx 代理配置

详情请参考项目根目录下的部署相关文件。
