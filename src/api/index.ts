
export * from './apiClient';
export * from './authService';
export * from './userService';
export * from './postService';
export * from './messageService';
export * from './notificationService';
export * from './pollService';

// Export all services in one object for convenience
import { authService } from './authService';
import { userService } from './userService';
import { postService } from './postService';
import { messageService } from './messageService';
import { notificationService } from './notificationService';
import { pollService } from './pollService';

export const api = {
  auth: authService,
  user: userService,
  post: postService,
  message: messageService,
  notification: notificationService,
  poll: pollService,
};
