import { http, HttpResponse } from 'msw';

// Mutable state for the mock
let mockStatus: string = 'AWAITING_PARENT';
let mockSecondsRemaining: number = 180;
let mockSecondaryGuardianPhone: string = '+2348099887766';
let mockToken: string = 'valid-token-123';
let mockOverrideCode: string = 'SAFE-7742-XPQR';

export const pickupHandlers = [
  // GET /pickup/recent
  http.get('/pickup/recent', () => {
    return HttpResponse.json({
      requests: [
        {
          id: 'pkp_001',
          status: 'APPROVED',
          childName: 'Zara Osei',
          delegateName: 'David Mensah',
          schoolName: 'Greenfield Academy',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          respondedBy: 'PRIMARY_PARENT',
        },
        {
          id: 'pkp_002',
          status: 'DENIED',
          childName: 'Zara Osei',
          delegateName: 'Unknown Person',
          schoolName: 'Greenfield Academy',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          incidentId: 'inc_9922',
          respondedBy: 'PRIMARY_PARENT',
        },
      ],
    });
  }),

  // GET /pickup/:id
  http.get('/pickup/:id', ({ params }: { params: any }) => {
    const { id } = params;
    
    // Auto-decrement seconds remaining for simulation
    if ((mockStatus === 'AWAITING_PARENT' || mockStatus === 'AWAITING_SECONDARY') && mockSecondsRemaining > 0) {
      mockSecondsRemaining = Math.max(0, mockSecondsRemaining - 2);
    }

    // Auto-escalate to secondary on timeout
    if (mockStatus === 'AWAITING_PARENT' && mockSecondsRemaining <= 0) {
      mockStatus = 'AWAITING_SECONDARY';
      mockSecondsRemaining = 180;
    }

    // Auto-escalate to timed out on secondary timeout
    if (mockStatus === 'AWAITING_SECONDARY' && mockSecondsRemaining <= 0) {
      mockStatus = 'TIMED_OUT';
    }

    return HttpResponse.json({
      pickupRequestId: id,
      status: mockStatus,
      delegate: {
        id: 'dlg_01HXYZ',
        fullName: 'David Mensah',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        relationship: 'DRIVER',
      },
      child: {
        id: 'chd_01HXYZ',
        fullName: 'Zara Osei',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
        grade: 'Primary 3',
        safepickId: 'SP-2025-00142',
      },
      school: {
        id: 'sch_01HXYZ',
        name: 'Greenfield Academy',
        address: '15 Palm Avenue, Lagos',
      },
      verificationMethod: 'QR',
      timeoutAt: new Date(Date.now() + mockSecondsRemaining * 1000).toISOString(),
      secondsRemaining: mockSecondsRemaining,
      createdAt: new Date(Date.now() - 60000).toISOString(),
    });
  }),

  // POST /pickup/:id/respond
  http.post('/pickup/:id/respond', async ({ params, request }: { params: any; request: any }) => {
    const { id } = params;
    const body = await request.json() as { decision: string; responderId: string };

    if (mockStatus !== 'AWAITING_PARENT') {
      return HttpResponse.json(
        { error: 'PICKUP_ALREADY_RESPONDED', message: 'This pickup request has already been responded to.' },
        { status: 400 }
      );
    }

    mockStatus = body.decision === 'APPROVE' ? 'APPROVED' : 'DENIED';

    return HttpResponse.json({
      pickupRequestId: id,
      status: mockStatus,
      respondedBy: 'PRIMARY_PARENT',
      respondedAt: new Date().toISOString(),
      incidentId: mockStatus === 'DENIED' ? 'inc_01HXYZ' : undefined,
      schoolNotified: true,
      delegateNotified: true,
    });
  }),

  // GET /respond/:token/validate
  http.get('/respond/:token/validate', ({ params }: { params: any }) => {
    const { token } = params;
    
    if (token === 'expired-token') {
      return HttpResponse.json({ error: 'TOKEN_EXPIRED', message: 'This link has expired.' }, { status: 400 });
    }
    if (token === 'used-token') {
      return HttpResponse.json({ error: 'TOKEN_ALREADY_USED', message: 'This link has already been used.' }, { status: 400 });
    }
    if (token !== mockToken) {
      return HttpResponse.json({ error: 'TOKEN_INVALID' }, { status: 404 });
    }

    return HttpResponse.json({
      valid: true,
      pickupRequestId: 'pkp_01HXYZ',
      delegate: {
        fullName: 'David Mensah',
        photoUrl: null,
        relationship: 'DRIVER'
      },
      child: {
        fullName: 'Zara Osei',
        grade: 'Primary 3',
        photoUrl: null
      },
      school: {
        name: 'Greenfield Academy',
        address: '15 Palm Avenue, Lagos'
      },
      verificationMethod: 'QR',
      secondsRemaining: mockSecondsRemaining,
      timeoutAt: new Date(Date.now() + mockSecondsRemaining * 1000).toISOString(),
    });
  }),

  // POST /respond/:token
  http.post('/respond/:token', async ({ request }: { request: any }) => {
    const body = await request.json() as { decision: string };
    
    mockStatus = body.decision === 'APPROVE' ? 'APPROVED' : 'DENIED';

    return HttpResponse.json({
      pickupRequestId: 'pkp_01HXYZ',
      status: mockStatus,
      respondedBy: 'SECONDARY_GUARDIAN',
      respondedAt: new Date().toISOString(),
      incidentId: mockStatus === 'DENIED' ? 'inc_02HXYZ' : undefined,
      schoolNotified: true,
      primaryParentNotified: true
    });
  }),

  // POST /override-codes/generate
  http.post('/override-codes/generate', async ({ request }: { request: any }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      overrideCode: {
        id: 'ovc_01HXYZ',
        code: 'SAFE-7742-XPQR',
        childId: body.childId,
        school: {
          id: body.schoolId,
          name: 'Greenfield Academy'
        },
        expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        usesRemaining: 1,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      }
    }, { status: 201 });
  }),

  // GET /override-codes
  http.get('/override-codes', () => {
    return HttpResponse.json({
      overrideCodes: [
        {
          id: 'ovc_01HXYZ',
          code: 'SAFE-7742-XPQR',
          school: {
            id: 'sch_01HXYZ',
            name: 'Greenfield Academy'
          },
          expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          usesRemaining: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }
      ]
    });
  }),

  // DELETE /override-codes/:id
  http.delete('/override-codes/:id', () => {
    return HttpResponse.json({
      message: 'Override code revoked.',
      revokedAt: new Date().toISOString()
    });
  }),

  // POST /pickup/:id/override
  http.post('/pickup/:id/override', async ({ request }: { request: any }) => {
    const body = await request.json() as { overrideCode: string };

    if (body.overrideCode !== mockOverrideCode) {
      return HttpResponse.json({ error: 'OVERRIDE_CODE_INVALID', message: 'The code entered is invalid, expired, or already used.' }, { status: 400 });
    }

    mockStatus = 'APPROVED_VIA_OVERRIDE';

    return HttpResponse.json({
      status: 'APPROVED_VIA_OVERRIDE',
      overrideCodeId: 'ovc_01HXYZ',
      auditEntryId: 'aud_01HXYZ',
      parentNotifiedAt: new Date().toISOString()
    });
  }),

  // POST /pickup/:id/hold
  http.post('/pickup/:id/hold', () => {
    mockStatus = 'CHILD_HELD';
    return HttpResponse.json({
      status: 'CHILD_HELD',
      incidentId: 'inc_03HXYZ',
      message: 'Incident filed. Child is under school supervision.'
    });
  }),
];

export const mockPickupScenarios = {
  reset: () => {
    mockStatus = 'AWAITING_PARENT';
    mockSecondsRemaining = 180;
  },
  setApproved: () => {
    mockStatus = 'APPROVED';
  },
  setDenied: () => {
    mockStatus = 'DENIED';
  },
  setTimedOut: () => {
    mockStatus = 'TIMED_OUT';
    mockSecondsRemaining = 0;
  },
  setReleased: () => {
    mockStatus = 'RELEASED';
  },
  setNearExpiry: () => {
    mockStatus = 'AWAITING_PARENT';
    mockSecondsRemaining = 10;
  },
};
