import { http, HttpResponse } from 'msw';

export const delegatesHandlers = [
  http.get('/delegates', ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');

    const delegates = [
      {
        id: "dlg_01HXYZ",
        fullName: "David Mensah",
        phone: "+2348055544433",
        relationship: "DRIVER",
        photoUrl: null,
        kycStatus: "APPROVED",
        kycAccessStatus: "NONE",
        kycVerifiedAt: "2025-12-20T10:00:00Z",
        failureReason: null,
        authorizations: [
          {
            id: "auth_01HXYZ",
            childId: "chd_01HXYZ",
            childName: "Zara Osei",
            status: "ACTIVE",
            allowedDays: ["MON","TUE","WED","THU","FRI"],
            allowedTimeStart: "14:00",
            allowedTimeEnd: "17:00",
            authType: "RECURRING"
          }
        ]
      },
      {
        id: "dlg_02HABC",
        fullName: "Abena Asante",
        phone: "+2348066655544",
        relationship: "NANNY",
        photoUrl: null,
        kycStatus: "PENDING",
        kycAccessStatus: "NONE",
        kycVerifiedAt: null,
        failureReason: null,
        authorizations: []
      }
    ];

    if (childId) {
      return HttpResponse.json({
        delegates: delegates.filter(d => 
          d.authorizations.some(a => a.childId === childId)
        )
      });
    }

    return HttpResponse.json({ delegates });
  }),

  http.get('/delegates/:delegateId', ({ params }: { params: { delegateId: string } }) => {
    const { delegateId } = params;
    
    if (delegateId === 'dlg_01HXYZ') {
      return HttpResponse.json({
        id: "dlg_01HXYZ",
        fullName: "David Mensah",
        phone: "+2348055544433",
        relationship: "DRIVER",
        photoUrl: null,
        kycStatus: "APPROVED",
        kycAccessStatus: "NONE",
        kycVerifiedAt: "2025-12-20T10:00:00Z",
        failureReason: null,
        authorizations: [
          {
            id: "auth_01HXYZ",
            childId: "chd_01HXYZ",
            childName: "Zara Osei",
            status: "ACTIVE",
            allowedDays: ["MON","TUE","WED","THU","FRI"],
            allowedTimeStart: "14:00",
            allowedTimeEnd: "17:00",
            authType: "RECURRING"
          }
        ]
      });
    }

    if (delegateId === 'dlg_02HABC') {
      return HttpResponse.json({
        id: "dlg_02HABC",
        fullName: "Abena Asante",
        phone: "+2348066655544",
        relationship: "NANNY",
        photoUrl: null,
        kycStatus: "PENDING",
        kycAccessStatus: "NONE",
        kycVerifiedAt: null,
        failureReason: null,
        authorizations: []
      });
    }

    return HttpResponse.json({ error: "DELEGATE_NOT_FOUND", message: "Delegate not found" }, { status: 404 });
  }),

  http.post('/delegates/invite', async ({ request }: { request: Request }) => {
    const payload = await request.json() as any;
    console.log('Creating invite with payload:', payload);

    return HttpResponse.json({
      inviteId: "inv_01HXYZ",
      inviteToken: "tok_mock_abc123",
      inviteUrl: "https://safepick.io/delegate/join?token=tok_mock_abc123",
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }, { status: 201 });
  }),

  http.delete('/delegates/invite/:inviteId', () => {
    return HttpResponse.json({ message: "Invite revoked." });
  }),

  http.get('/delegates/invites/pending', () => {
    return HttpResponse.json({
      invites: [
        {
          id: "inv_02HABC",
          inviteUrl: "https://safepick.io/delegate/join?token=tok_pending",
          relationship: "NANNY",
          childIds: ["chd_01HXYZ"],
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          phone: "+234 •••• 5544"
        }
      ]
    });
  }),

  http.post('/delegates/:delegateId/remind', () => {
    return HttpResponse.json({ message: "Reminder sent." });
  }),

  http.post('/delegates/:delegateId/kyc-access', () => {
    return HttpResponse.json({ message: "Access requested." });
  }),

  http.delete('/delegates/:delegateId/authorizations', () => {
    return HttpResponse.json({ message: "All access revoked." });
  }),

  http.delete('/delegates/:delegateId', () => {
    return HttpResponse.json({ message: "Delegate removed." });
  }),

  http.delete('/delegates/:delegateId/authorizations/:childId', () => {
    return HttpResponse.json({ message: "Authorization revoked." });
  }),

  http.patch('/delegates/:delegateId/authorizations/:childId/status', async ({ request }: { request: Request }) => {
    const { status } = await request.json() as any;
    return HttpResponse.json({ message: `Authorization status updated to ${status}.` });
  }),
];
