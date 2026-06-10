FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=4001

EXPOSE ${PORT}

CMD ["node", "index.js"]
