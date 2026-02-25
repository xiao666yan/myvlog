#!/bin/bash

# MyVlog 部署脚本
# 用法: ./deploy.sh

set -e  # 遇到错误立即退出

echo "========================================"
echo "       MyVlog 部署脚本"
echo "========================================"

# 1. 进入项目目录
cd ~/myvlog

# 2. 拉取最新代码
echo "[1/4] 拉取最新代码..."
git fetch --all
git reset --hard origin/master

# 3. 执行数据库更新（如果有新表）
echo "[2/4] 检查数据库更新..."
# 注意：需要先在服务器上安装 MySQL 客户端或使用 Docker 执行 SQL
# docker exec -i mysql mysql -uroot -p123456 myvlog < database/add_columns_tables.sql

# 4. 使用 Docker 构建前端
echo "[3/4] 构建前端..."
sudo docker run --rm \
  -v ${PWD}/frontend:/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install && npm run build"

# 5. 重启 Docker 服务
echo "[4/4] 重启服务..."
sudo docker-compose down
sudo docker-compose build backend
sudo docker-compose up -d

echo ""
echo "========================================"
echo "       部署完成！"
echo "========================================"
echo ""
echo "服务状态:"
sudo docker-compose ps
