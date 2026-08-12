FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# npm 10 otherwise rejects peer-only optional packages omitted by the npm 11 lockfile.
RUN npm ci --legacy-peer-deps

COPY . .

ARG VITE_API_URL=http://localhost:8080
ARG VITE_WS_URL=http://localhost:8080/ws

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build


FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
