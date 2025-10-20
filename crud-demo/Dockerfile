FROM node:20
WORKDIR /app
COPY . .
RUN npm i -g serve
EXPOSE 8080
CMD ["serve","-s",".","-l","8080"]
