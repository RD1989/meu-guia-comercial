// Tenant detection from URL slug
export function getTenantSlug(): string | null {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);
  
  // Check if first segment is a tenant slug (e.g., /itaperuna/...)
  if (parts.length > 0 && !['auth', 'admin', 'dashboard'].includes(parts[0])) {
    return parts[0];
  }
  
  // Check subdomain
  const hostname = window.location.hostname;
  const parts2 = hostname.split('.');
  if (parts2.length > 2) {
    return parts2[0];
  }
  
  return null;
}
