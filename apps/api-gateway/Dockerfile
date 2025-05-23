# 1. Base image
FROM node:18-alpine As builder

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# 4. Install dependencies for build (including devDependencies for tsc)
RUN npm ci

# 5. Copy the rest of the application code
COPY . .

# 6. Build TypeScript code
RUN npm run build

# --- Release Stage ---
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json for production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# 7. Expose the port (should match .env or default in server.ts)
EXPOSE 3001

# 8. Define the CMD to start the application
CMD ["node", "dist/server.js"] 