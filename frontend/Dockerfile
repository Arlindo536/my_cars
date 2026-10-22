# 1. Build the Angular app
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# 2. Serve it with nginx, which also proxies the API
FROM nginx:1.27-alpine
# The image's entrypoint renders templates/*.template into conf.d and, with this flag,
# exposes the container's DNS server as NGINX_LOCAL_RESOLVERS (used in nginx.conf)
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/my_cars_frontend/browser /usr/share/nginx/html
EXPOSE 80
