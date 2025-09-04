FROM node:20-alpine AS build
WORKDIR /app
COPY . ./
RUN yarn install
COPY src/ ./src/
RUN yarn build
 
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

