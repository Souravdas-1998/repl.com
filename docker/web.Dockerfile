FROM node:24-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/clothing-store/package.json ./artifacts/clothing-store/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS builder
COPY . .
ARG BASE_PATH=/
ARG PORT=3000
ENV BASE_PATH=$BASE_PATH
ENV PORT=$PORT
ENV NODE_ENV=production
RUN pnpm --filter @workspace/clothing-store run build

# Serve with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/artifacts/clothing-store/dist/public /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
