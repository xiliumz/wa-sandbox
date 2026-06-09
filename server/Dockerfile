FROM node:20-alpine
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./server/

EXPOSE 3001

CMD ["node", "server/index.js"]
