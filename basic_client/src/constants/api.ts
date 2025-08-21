export const API_ENDPOINTS = {
  // Development endpoints - update these based on your environment
  DEVELOPMENT: 'http://localhost:8000',
  PRODUCTION: 'https://your-production-api.com', // Update with actual production URL

  // Default endpoint - will be overridden by environment
  DEFAULT: 'http://localhost:8000',
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
