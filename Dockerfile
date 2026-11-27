FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev && npm cache clean --force

COPY src ./src
COPY testes ./testes
COPY tsconfig.json ./

ENV NODE_ENV=production

USER node
EXPOSE 3000

CMD ["npm", "start"]
