# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript
RUN npx tsc

# Start the app
CMD ["node", "dist/server.js"]
