FROM node:10-alpine as base
RUN apk add git python alpine-sdk 
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install
COPY . .
RUN yarn build
COPY ./report.html ./static/

FROM node:10-alpine as runtime
WORKDIR /app
ENV NODE_ENV="production"
COPY --from=base /app .
EXPOSE 3000
CMD ["node", "./dist/main.js"]