# Stage 1: Build the workspace
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy workspaces configuration and lockfile
COPY package.json bun.lock* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/cms/package.json ./apps/cms/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/types/package.json ./packages/types/

# Install all workspace dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the workspace source code
COPY . .

# Build the backend app (which compiles the typescript code)
RUN bun --filter backend build

# Stage 2: Production runner
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Copy built packages and node_modules from builder stage
COPY --from=builder /app/package.json /app/bun.lock* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/backend ./apps/backend

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Set working directory to the backend application
WORKDIR /app/apps/backend

# Expose the application port
EXPOSE 3000

# Run the Express server
CMD ["bun", "run", "start"]
