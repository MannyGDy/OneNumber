# ---- Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Copy source and build
COPY client ./
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine

WORKDIR /app

# Only copy production artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment variables at runtime
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]

