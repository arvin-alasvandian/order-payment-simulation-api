# Use a small, modern Node image
FROM node:22-alpine

# Create app dir
WORKDIR /app

# Install only prod deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

# Expose app port (matches PORT env)
EXPOSE 5000

# Default command
CMD ["node", "server.js"]
