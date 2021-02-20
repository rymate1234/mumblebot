FROM node:12-alpine as base
RUN apk add git python alpine-sdk 
WORKDIR /app
COPY . /app/
RUN yarn install
RUN yarn build
RUN cp ./dist/report.html ./static/

FROM node:12-alpine as runtime
RUN apk add ffmpeg
WORKDIR /app
ENV NODE_ENV="production"
COPY --from=base /app .
EXPOSE 3000
CMD ["npm", "run", "start"]