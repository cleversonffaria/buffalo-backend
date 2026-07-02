FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable && yarn install --frozen-lockfile

FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN corepack enable && yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./

RUN corepack enable && yarn install --frozen-lockfile --production=true && yarn cache clean

COPY --from=build /app/dist ./dist

RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "dist/main"]
