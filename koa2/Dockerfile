FROM node:20-alpine

WORKDIR /app

# 先安装依赖，利用 Docker 层缓存
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# 复制源码
COPY . .

# 删除本地开发环境配置；生产变量由平台/环境注入（优先于 .env）
RUN rm -f .env

EXPOSE 3000

# 启动时会自动连接数据库并同步建表（sequelize.sync）
CMD ["node", "app.js"]
