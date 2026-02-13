export type AuditAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPERSONATE' | 'EXPORT';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  module: string;
  description: string;
  ip: string;
  isImpersonated: boolean;
  impersonationDetail?: string;
}
