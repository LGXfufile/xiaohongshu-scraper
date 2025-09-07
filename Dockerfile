# Playwright的Headless Shell可能在Vercel的lambda环境中不可用
# 我们需要使用playwright-core和chromium的轻量级版本
FROM ubuntu:20.04

# 安装必要的系统依赖
RUN apt-get update && \
    apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    wget \
    ca-certificates

# 为Vercel Serverless Functions优化
ENV PLAYWRIGHT_BROWSERS_PATH=/var/task/.cache/ms-playwright