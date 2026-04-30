/**
 * Centralized query keys for TanStack Query deduplication.
 * All hooks should use these keys to ensure consistent caching.
 */

export const queryKeys = {
  // Auth
  profile: ['auth', 'profile'] as const,

  // Children
  children: ['children'] as const,
  child: (id: string) => ['children', id] as const,
  childSchool: (id: string) => ['children', id, 'school'] as const,
  childAudit: (id: string) => ['children', id, 'audit'] as const,

  // Delegates
  delegates: ['delegates'] as const,
  delegatesForChild: (childId: string) => ['delegates', 'child', childId] as const,
  delegateProfile: (id: string) => ['delegates', id] as const,

  // Pickup
  pickupRequests: ['pickup', 'requests'] as const,
  pickupHistory: ['pickup', 'history'] as const,
  pickupRequest: (id: string) => ['pickup', id] as const,
  pickupRecent: ['pickup', 'recent'] as const,

  // Attendance
  attendance: (childId: string, month?: string) =>
    month ? ['attendance', childId, month] : ['attendance', childId],

  // Schools
  schools: ['schools'] as const,
  schoolSearch: (query: string) => ['schools', 'search', query] as const,
  school: (id: string) => ['schools', id] as const,
  enrollment: (childId: string) => ['enrollment', childId] as const,

  // Secondary guardians
  secondaryGuardians: ['secondary-guardians'] as const,
  secondaryPickup: (id: string) => ['secondary-pickup', id] as const,
  secondaryHistory: ['secondary-history'] as const,

  // Emergency
  emergencyStatus: ['emergency-status'] as const,
  sosAlert: (sosId: string) => ['sos-alert', sosId] as const,

  // Override codes
  overrideCodes: (childId: string) => ['override-codes', childId] as const,
  overrideToken: (token: string) => ['secondary-token', token] as const,

  // Audit
  auditLog: (filters: any) => ['audit-log', filters] as const,
  incidents: (filters: any) => ['incidents', filters] as const,

  // Authorizations
  authorizations: (childId?: string) => ['authorizations', childId] as const,
  pendingDelegates: ['pending-delegates'] as const,

  // Verification
  qrToken: (authorizationId: string) => ['qr-token', authorizationId] as const,
  verificationSession: (sessionId: string) => ['verification-session', sessionId] as const,

  // Invites
  invites: {
    pending: ['invites', 'pending'] as const,
  },

  // Delegate section (separate auth namespace)
  delegate: {
    profile: ['delegate', 'profile'] as const,
    authorizations: ['delegate', 'authorizations'] as const,
    schedule: (date: string) => ['delegate', 'schedule', date] as const,
    pickupRequests: ['delegate', 'pickup-requests'] as const,
    qrToken: (authorizationId: string) => ['delegate', 'qr-token', authorizationId] as const,
  },

  // Guardian lookup
  guardianLookup: (phone: string) => ['guardian-lookup', phone] as const,
};
