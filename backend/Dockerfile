FROM node:18-slim

# Set container working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Hugging Face default port
ENV PORT=7860
EXPOSE 7860

# Command to start your application
CMD ["node", "server.js"]