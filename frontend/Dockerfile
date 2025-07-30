FROM node:20-alpine as build-stage

# Establece el directorio de trabajo
WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine as production-stage

COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
