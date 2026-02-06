# Build from monorepo root: docker build -t twilio-bridge -f apps/twilio-bridge/Dockerfile .
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files for dependency resolution
COPY packages/agent-config/package.json ./packages/agent-config/
COPY apps/twilio-bridge/package.json ./apps/twilio-bridge/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/agent-config ./packages/agent-config
COPY apps/twilio-bridge ./apps/twilio-bridge

# Build agent-config first, then twilio-bridge
RUN pnpm --filter @callmemaybe/agent-config build && \
    pnpm --filter twilio-bridge build

# Production image
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/agent-config/package.json ./packages/agent-config/
COPY apps/twilio-bridge/package.json ./apps/twilio-bridge/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files
COPY --from=builder /app/packages/agent-config/dist ./packages/agent-config/dist
COPY --from=builder /app/apps/twilio-bridge/dist ./apps/twilio-bridge/dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

WORKDIR /app/apps/twilio-bridge

EXPOSE 8080

CMD ["node", "dist/index.js"]
