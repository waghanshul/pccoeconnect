import { supabase } from "@/integrations/supabase/client";

// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePCCOEEmail = (email: string): boolean => {
  return email.endsWith('@pccoepune.org');
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Security audit logging
export const logSecurityEvent = async (
  action: string,
  details: Record<string, any>,
  targetUserId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Cannot log security event: user not authenticated');
      return;
    }

    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: user.id,
        action,
        target_user_id: targetUserId,
        details
      });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    console.error('Security logging error:', error);
  }
};

// Role-based access control
export const checkAdminPermission = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('get_user_role');
    
    if (error) {
      console.error('Permission check error:', error);
      return false;
    }
    
    return data === 'admin';
  } catch (error) {
    console.error('Admin permission check failed:', error);
    return false;
  }
};

// Rate limiting utilities (client-side basic implementation)
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

export const checkRateLimit = (
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now - record.timestamp > windowMs) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
};