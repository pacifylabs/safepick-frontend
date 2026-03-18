import { http, HttpResponse } from 'msw';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mutable state for the mock
let mockGuardians: any[] = [
  {
    id: 'sg_01HXYZ',
    fullName: 'Kwame Osei',
    phone: '+233244123456',
    notifyChannel: 'SMS',
    status: 'ACTIVE',
    acceptedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sg_02HXYZ',
    fullName: 'Efua Mensah',
    phone: '+233244987654',
    notifyChannel: 'WHATSAPP',
    status: 'PENDING_INVITE',
    acceptedAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

let mockSecondaryHistory: any[] = [
  {
    id: 'sh_01',
    decision: 'APPROVE',
    childName: 'Zara Osei',
    respondedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sh_02',
    decision: 'DENY',
    childName: 'Zara Osei',
    respondedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const secondaryGuardianHandlers = [
  // Parent-scoped
  http.post('/secondary-guardians/invite', async ({ request }: { request: any }) => {
    const body = await request.json() as any;
    await delay(800);
    
    const newGuardian = {
      id: `sg_${Math.random().toString(36).substr(2, 9)}`,
      fullName: body.fullName,
      phone: body.phone,
      notifyChannel: body.notifyChannel,
      status: 'PENDING_INVITE',
      acceptedAt: null,
      createdAt: new Date().toISOString(),
    };
    
    mockGuardians.push(newGuardian);
    
    return HttpResponse.json({
      secondaryGuardian: newGuardian,
      inviteSent: true,
      channel: body.notifyChannel,
    }, { status: 201 });
  }),

  http.get('/secondary-guardians', () => {
    return HttpResponse.json({
      secondaryGuardians: mockGuardians,
    });
  }),

  http.post('/secondary-guardians/:id/resend-invite', async () => {
    await delay(600);
    return HttpResponse.json({
      message: 'Invite resent successfully',
      inviteExpiresAt: new Date(Date.now() + 3600000 * 24).toISOString(),
    });
  }),

  http.patch('/secondary-guardians/:id', async ({ params, request }: { params: any; request: any }) => {
    const { id } = params;
    const body = await request.json() as any;
    await delay(600);
    
    const idx = mockGuardians.findIndex(g => g.id === id);
    if (idx !== -1) {
      mockGuardians[idx] = { ...mockGuardians[idx], ...body };
      return HttpResponse.json(mockGuardians[idx]);
    }
    
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.delete('/secondary-guardians/:id', async ({ params }: { params: any }) => {
    const { id } = params;
    await delay(600);
    
    const idx = mockGuardians.findIndex(g => g.id === id);
    if (idx !== -1) {
      mockGuardians[idx].status = 'REMOVED';
      return HttpResponse.json({ message: 'Removed successfully', removedAt: new Date().toISOString() });
    }
    
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  // Public
  http.get('/secondary-guardians/invite/:token/validate', ({ params }: { params: any }) => {
    const { token } = params;
    
    if (token === 'expired') {
      return HttpResponse.json({ valid: false, message: 'INVITE_EXPIRED' }, { status: 400 });
    }
    if (token === 'used') {
      return HttpResponse.json({ valid: false, message: 'INVITE_ALREADY_USED' }, { status: 400 });
    }

    return HttpResponse.json({
      valid: true,
      inviterName: 'Kofi Osei',
      guardianName: 'Kwame Osei',
      phone: '+233244123456',
      expiresAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    });
  }),

  http.post('/secondary-guardians/invite/:token/accept', async ({ request }: { request: any }) => {
    await delay(1000);
    return HttpResponse.json({
      accessToken: 'mock-secondary-token',
      refreshToken: 'mock-secondary-refresh',
      secondaryGuardian: mockGuardians[0],
      pendingPickupRequestId: 'pkp_01HXYZ',
    });
  }),

  http.post('/auth/secondary/login', async () => {
    await delay(800);
    return HttpResponse.json({
      otpToken: 'mock-otp-token',
      expiresIn: 300,
    });
  }),

  http.post('/auth/secondary/verify-otp', async () => {
    await delay(1000);
    return HttpResponse.json({
      accessToken: 'mock-secondary-token',
      refreshToken: 'mock-secondary-refresh',
      secondaryGuardian: mockGuardians[0],
      pendingPickupRequestId: 'pkp_01HXYZ',
    });
  }),

  // Secondary-scoped
  http.get('/secondary/pickup/:id', ({ params }: { params: any }) => {
    const { id } = params;
    return HttpResponse.json({
      id: id,
      pickupRequestId: id,
      status: 'AWAITING_SECONDARY',
      delegate: {
        id: 'dlg_01',
        fullName: 'David Mensah',
        photoUrl: null,
        relationship: 'DRIVER',
      },
      child: {
        id: 'chd_01',
        fullName: 'Zara Osei',
        photoUrl: null,
        grade: 'Primary 3',
        safepickId: 'SP-2025-00142',
      },
      school: {
        id: 'sch_01',
        name: 'Greenfield Academy',
        address: '15 Palm Avenue, Lagos',
      },
      verificationMethod: 'QR',
      timeoutAt: new Date(Date.now() + 180000).toISOString(),
      secondsRemaining: 180,
      createdAt: new Date().toISOString(),
      assignedAsSecondaryFor: 'Kofi Osei',
      escalatedAt: new Date().toISOString(),
    });
  }),

  http.post('/secondary/pickup/:id/respond', async ({ params, request }: { params: any; request: any }) => {
    const { id } = params;
    const body = await request.json() as any;
    await delay(1000);
    
    mockSecondaryHistory.unshift({
      id: `sh_${Math.random().toString(36).substr(2, 5)}`,
      decision: body.decision,
      childName: 'Zara Osei',
      respondedAt: new Date().toISOString(),
    });

    return HttpResponse.json({
      id: `resp_${id}`,
      pickupRequestId: id,
      secondaryGuardianAccountId: 'sg_01HXYZ',
      decision: body.decision,
      respondedAt: new Date().toISOString(),
    });
  }),

  http.get('/secondary/history', () => {
    return HttpResponse.json({
      history: mockSecondaryHistory,
    });
  }),
];
