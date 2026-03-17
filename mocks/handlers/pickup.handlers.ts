import { http, HttpResponse } from 'msw';

// Mutable state for the mock
let mockStatus: string = 'AWAITING_PARENT';
let mockSecondsRemaining: number = 180;

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
        },
        {
          id: 'pkp_002',
          status: 'DENIED',
          childName: 'Zara Osei',
          delegateName: 'Unknown Person',
          schoolName: 'Greenfield Academy',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          incidentId: 'inc_9922',
        },
      ],
    });
  }),

  // GET /pickup/:id
  http.get('/pickup/:id', ({ params }) => {
    const { id } = params;
    
    // Auto-decrement seconds remaining for simulation
    if (mockStatus === 'AWAITING_PARENT' && mockSecondsRemaining > 0) {
      mockSecondsRemaining = Math.max(0, mockSecondsRemaining - 2);
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
  http.post('/pickup/:id/respond', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { decision: string; responderId: string };

    if (mockStatus !== 'AWAITING_PARENT') {
      return HttpResponse.json(
        { error: 'PICKUP_ALREADY_RESPONDED', message: 'This pickup request has already been responded to.' },
        { status: 400 }
      );
    }

    mockStatus = body.decision === 'APPROVE' ? 'APPROVED' : 'DENIED';

    // Simulate real-time update to other tabs
    if (typeof window !== 'undefined') {
      window.postMessage({
        type: mockStatus === 'APPROVED' ? 'PICKUP_APPROVED' : 'PICKUP_DENIED',
        pickupRequestId: id,
        childName: 'Zara Osei',
      }, '*');
    }

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
  setNearExpiry: () => {
    mockStatus = 'AWAITING_PARENT';
    mockSecondsRemaining = 10;
  },
};
