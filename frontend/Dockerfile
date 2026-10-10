FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint-resolver.sh /docker-entrypoint.d/40-resolver.sh
RUN chmod +x /docker-entrypoint.d/40-resolver.sh
EXPOSE 8080
