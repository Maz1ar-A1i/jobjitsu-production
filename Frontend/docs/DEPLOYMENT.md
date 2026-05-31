# Deployment Documentation

## Overview

This document provides comprehensive guidance for deploying the React Redux template project to various hosting platforms and environments.

## 🚀 Build Process

### Production Build

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

The build process creates an optimized production bundle in the `dist/` directory with:

- Minified JavaScript bundles
- Optimized CSS with vendor prefixes
- Compressed assets
- Source maps (optional)

### Build Configuration

**Location**: `vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
        api: "modern",
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false, // Set to true for debugging
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
```

## 🌍 Environment Configuration

### Environment Variables

Create environment-specific files:

```env
# .env.production
VITE_APP_API_URL=https://api.production.com
VITE_APP_API_BASE_URL=https://api.production.com/v1
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
VITE_FACEBOOK_APP_ID=your-production-facebook-app-id
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_FACEBOOK_AUTH=true
```

```env
# .env.staging
VITE_APP_API_URL=https://api.staging.com
VITE_APP_API_BASE_URL=https://api.staging.com/v1
VITE_GOOGLE_CLIENT_ID=your-staging-google-client-id
VITE_FACEBOOK_APP_ID=your-staging-facebook-app-id
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_FACEBOOK_AUTH=true
```

### Environment-Specific Builds

```bash
# Production build
npm run build

# Staging build
npm run build:staging

# Development build
npm run build:dev
```

Add to `package.json`:

```json
{
  "scripts": {
    "build:staging": "vite build --mode staging",
    "build:dev": "vite build --mode development"
  }
}
```

## 📦 Static Hosting Platforms

### Netlify Deployment

#### 1. Manual Deployment

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist/` folder to Netlify
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --dir=dist --prod
   ```

#### 2. Continuous Deployment

Create `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Environment Variables in Netlify

Set environment variables in Netlify dashboard:

- Go to Site settings > Environment variables
- Add your production environment variables

### Vercel Deployment

#### 1. Manual Deployment

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

#### 2. Continuous Deployment

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Environment Variables in Vercel

Set environment variables in Vercel dashboard:

- Go to Project settings > Environment variables
- Add your production environment variables

### AWS S3 + CloudFront

#### 1. S3 Bucket Setup

```bash
# Create S3 bucket
aws s3 mb s3://your-app-bucket-name

# Configure bucket for static website hosting
aws s3 website s3://your-app-bucket-name --index-document index.html --error-document index.html
```

#### 2. Upload Build Files

```bash
# Sync build files to S3
aws s3 sync dist/ s3://your-app-bucket-name --delete

# Set cache headers
aws s3 sync dist/ s3://your-app-bucket-name --delete --cache-control max-age=31536000,public
```

#### 3. CloudFront Distribution

Create CloudFront distribution:

- Origin: S3 bucket
- Default root object: `index.html`
- Error pages: Redirect 404 to `/index.html`

#### 4. Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash

# Build the project
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-app-bucket-name --delete --cache-control max-age=31536000,public

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Deployment completed!"
```

### GitHub Pages

#### 1. GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_APP_API_URL: ${{ secrets.VITE_APP_API_URL }}
          VITE_APP_API_BASE_URL: ${{ secrets.VITE_APP_API_BASE_URL }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 2. Repository Settings

- Go to Settings > Pages
- Source: Deploy from a branch
- Branch: `gh-pages`
- Folder: `/ (root)`

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Docker Deployment Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build and run with Docker
docker build -t react-redux-app .
docker run -p 80:80 react-redux-app

# Push to Docker Hub
docker tag react-redux-app your-username/react-redux-app
docker push your-username/react-redux-app
```

## ☁️ Cloud Platform Deployment

### Google Cloud Platform (GCP)

#### 1. App Engine

Create `app.yaml`:

```yaml
runtime: nodejs18

handlers:
  - url: /static
    static_dir: dist/static
    secure: always

  - url: /.*
    static_files: dist/index.html
    upload: dist/index.html
    secure: always

env_variables:
  NODE_ENV: "production"
```

Deploy:

```bash
gcloud app deploy
```

#### 2. Cloud Run

Create `Dockerfile.cloudrun`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Use serve to run the app
RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
```

Deploy:

```bash
gcloud run deploy react-redux-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Microsoft Azure

#### 1. Static Web Apps

Create `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3

      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"
```

#### 2. App Service

Create `.deployment`:

```ini
[config]
command = npm run build
```

Deploy:

```bash
az webapp up --name your-app-name --resource-group your-resource-group
```

## 🔧 CI/CD Pipelines

### GitHub Actions (Complete Pipeline)

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_APP_API_URL: ${{ secrets.VITE_APP_API_URL }}
          VITE_APP_API_BASE_URL: ${{ secrets.VITE_APP_API_BASE_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/

      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

### GitLab CI/CD

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
    - npm run lint

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploying to production..."
  only:
    - main
```

## 🔍 Monitoring and Analytics

### Performance Monitoring

#### 1. Web Vitals

Add to `index.html`:

```html
<script>
  // Web Vitals monitoring
  import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
</script>
```

#### 2. Error Tracking

```javascript
// Error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Send to error tracking service
    console.error("Error:", error, errorInfo);
  }
}
```

### Analytics Integration

```javascript
// Google Analytics
import ReactGA from "react-ga4";

ReactGA.initialize("GA_MEASUREMENT_ID");

// Track page views
useEffect(() => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}, [location]);
```

## 🔒 Security Considerations

### Security Headers

Add to nginx configuration or hosting platform:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### HTTPS Configuration

- Enable HTTPS on all hosting platforms
- Redirect HTTP to HTTPS
- Use HSTS headers
- Configure SSL certificates

### Environment Variable Security

- Never commit sensitive environment variables
- Use platform-specific secret management
- Rotate API keys regularly
- Use different keys for different environments

## 📊 Performance Optimization

### Build Optimization

```javascript
// vite.config.js optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          router: ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

### Caching Strategy

```nginx
# Nginx caching configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

### CDN Configuration

- Use CDN for static assets
- Configure proper cache headers
- Enable compression
- Use edge locations

## 🚨 Troubleshooting

### Common Deployment Issues

1. **404 Errors on Refresh**

   - Configure SPA routing in hosting platform
   - Add redirect rules for client-side routing

2. **Environment Variables Not Loading**

   - Check variable naming (must start with VITE\_)
   - Verify environment configuration
   - Rebuild after environment changes

3. **Build Failures**

   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Performance Issues**
   - Enable gzip compression
   - Optimize bundle size
   - Use CDN for assets
   - Implement lazy loading

### Debug Commands

```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm install -g vite-bundle-analyzer
vite-bundle-analyzer dist

# Check environment variables
npm run build -- --mode production
```

This comprehensive deployment documentation provides developers with detailed information about deploying the React Redux template to various platforms and environments.
