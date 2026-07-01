# Stage 1: Build the React app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Accept build-time env vars (Vite bakes these into the bundle)
ARG VITE_WEBHOOK_URL
ARG VITE_VERIFY_TOKEN
ARG VITE_APP_SECRET
ARG VITE_WS_URL
ARG VITE_BACKEND_API_URL
ARG VITE_POLL_INTERVAL
ARG VITE_USER_PHONE
ARG VITE_BUSINESS_PHONE

ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL
ENV VITE_VERIFY_TOKEN=$VITE_VERIFY_TOKEN
ENV VITE_APP_SECRET=$VITE_APP_SECRET
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL
ENV VITE_POLL_INTERVAL=$VITE_POLL_INTERVAL
ENV VITE_USER_PHONE=$VITE_USER_PHONE
ENV VITE_BUSINESS_PHONE=$VITE_BUSINESS_PHONE

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
