import type { RouteSegmentConfig } from 'next/dist/server/future/route-modules/route-module'

// This configuration applies to all routes in this directory
export const routeConfig: RouteSegmentConfig = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
} 