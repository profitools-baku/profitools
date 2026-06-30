FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

# Create uploads directory and set permissions
RUN mkdir -p public/uploads && chown -R node:node public/uploads

USER node

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/boot.js"]
