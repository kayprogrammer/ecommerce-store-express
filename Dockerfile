# Use an official Node.js runtime as a parent image
FROM node:latest as builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install

# Copy all files from the current directory to the working directory
COPY . .

# Create js files
RUN npx tsc && cp -R templates dist/templates

# Development stage
FROM builder as development
# Set NODE_ENV to development
ENV NODE_ENV=development

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application(in development)
CMD ["npm", "run", "dev"]

# Production stage
FROM builder as production
# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the production command
CMD ["npm", "start"]