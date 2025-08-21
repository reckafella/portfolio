// Error Pages Exports
export { default as NotFoundPage } from './NotFoundPage';
export { default as BadRequestPage } from './BadRequestPage';
export { default as UnauthorizedPage } from './UnauthorizedPage';
export { default as ForbiddenPage } from './ForbiddenPage';
export { default as ServerErrorPage } from './ServerErrorPage';

// Error Page Components Map
export const ErrorPages = {
  400: 'BadRequestPage',
  401: 'UnauthorizedPage', 
  403: 'ForbiddenPage',
  404: 'NotFoundPage',
  500: 'ServerErrorPage'
} as const;

// Error Page Routes
export const ErrorRoutes = [
  { path: '/error/400', component: 'BadRequestPage' },
  { path: '/error/401', component: 'UnauthorizedPage' },
  { path: '/error/403', component: 'ForbiddenPage' },
  { path: '/error/404', component: 'NotFoundPage' },
  { path: '/error/500', component: 'ServerErrorPage' }
] as const;
