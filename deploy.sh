#!/bin/bash

# ================================================================= #
# MyVlog 自动化部署脚本 (deploy.sh)
# 适用于 Linux 服务器环境
# ================================================================= #

# 设置错误即停止
set -e

echo "🚀 [1/5] 开始从 GitHub 拉取最新代码..."
git pull origin main

echo "📦 [2/5] 开始构建前端项目..."
cd frontend
# 检查是否安装了依赖，没安装则安装
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build
cd ..

echo "🔨 [3/5] 开始打包后端项目..."
# 使用 Maven 打包，跳过测试以加快速度
mvn clean package -DskipTests

echo "🛑 [4/5] 正在停止旧的服务进程..."
# 查找占用 3060 端口的进程并关闭
PID=$(lsof -t -i:3060)
if [ -n "$PID" ]; then
    echo "发现正在运行的进程 (PID: $PID)，正在关闭..."
    kill -9 $PID
    sleep 2
fi

echo "🌟 [5/5] 启动新的服务..."
# 这里的 JAR 包名称根据 pom.xml 中的 artifactId 和 version 确定
JAR_NAME="target/myvlog-backend-0.0.1-SNAPSHOT.jar"

if [ -f "$JAR_NAME" ]; then
    # 使用 nohup 在后台运行，并将日志输出到 logs/app.log
    mkdir -p logs
    nohup java -jar "$JAR_NAME" --spring.profiles.active=prod > logs/app.log 2>&1 &
    echo "✅ 服务已在后台启动！"
    echo "💡 您可以通过查看 logs/app.log 来监控启动日志。"
else
    echo "❌ 错误：找不到 JAR 文件 $JAR_NAME"
    exit 1
fi

echo "🎉 部署成功！"
