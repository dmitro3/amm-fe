# build stage
FROM node:14-alpine as build

WORKDIR /app
COPY . .

RUN yarn install  
RUN yarn run build

# production stage
FROM nginx:1.17-alpine as production
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
