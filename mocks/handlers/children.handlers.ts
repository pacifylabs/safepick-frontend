import { http, HttpResponse } from "msw";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PARENT = {
  id: "user_parent_1",
  fullName: "Amara Osei",
  phone: "+2348012345678",
};

const MOCK_CHILDREN = [
  {
    id: "child_1",
    safepickId: "SP-2026-00001",
    fullName: "Zara Osei",
    dateOfBirth: "2018-05-12",
    grade: "Primary 3",
    photoUrl: null,
    parentId: "user_parent_1",
    parent: MOCK_PARENT,
    // secondaryGuardianId: "user_delegate_1",
    // secondaryGuardian: {
    //   id: "user_delegate_1",
    //   fullName: "David Mensah",
    //   phone: "+233240000001",
    // },
    school: null,
    enrollmentStatus: "PENDING_SCHOOL",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: "child_2",
    safepickId: "SP-2026-00002",
    fullName: "Kofi Osei",
    dateOfBirth: "2021-09-20",
    grade: "Nursery 2",
    photoUrl: null,
    parentId: "user_parent_1",
    parent: MOCK_PARENT,
    // secondaryGuardianId: "user_delegate_2",
    // secondaryGuardian: {
    //   id: "user_delegate_2",
    //   fullName: "Sarah Antwi",
    //   phone: "+233240000002",
    // },
    school: {
      id: "school_1",
      name: "Greenfield Academy",
    },
    enrollmentStatus: "VERIFIED",
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
  },
  {
    id: "child_3",
    safepickId: "SP-2026-00003",
    fullName: "Ama Osei",
    dateOfBirth: "2019-11-05",
    grade: "Primary 1",
    photoUrl: null,
    parentId: "user_parent_1",
    parent: MOCK_PARENT,
    // secondaryGuardianId: "user_delegate_1",
    // secondaryGuardian: {
    //   id: "user_delegate_1",
    //   fullName: "David Mensah",
    //   phone: "+233240000001",
    // },
    school: {
      id: "school_1",
      name: "Greenfield Academy",
    },
    enrollmentStatus: "VERIFIED",
    createdAt: new Date(Date.now() - 5184000000).toISOString(),
  },
  {
    id: "child_4",
    safepickId: "SP-2026-00004",
    fullName: "Kwame Osei",
    dateOfBirth: "2023-02-14",
    grade: "Toddler",
    photoUrl: null,
    parentId: "user_parent_1",
    parent: MOCK_PARENT,
    // secondaryGuardianId: "user_delegate_2",
    // secondaryGuardian: {
    //   id: "user_delegate_2",
    //   fullName: "Sarah Antwi",
    //   phone: "+233240000002",
    // },
    school: {
      id: "school_1",
      name: "Greenfield Academy",
    },
    enrollmentStatus: "VERIFIED",
    createdAt: new Date(Date.now() - 7776000000).toISOString(),
  },
  {
    id: "child_5",
    safepickId: "SP-2026-00005",
    fullName: "Esi Osei",
    dateOfBirth: "2017-08-30",
    grade: "Primary 4",
    photoUrl: null,
    parentId: "user_parent_1",
    parent: MOCK_PARENT,
    // secondaryGuardianId: "user_delegate_1",
    // secondaryGuardian: {
    //   id: "user_delegate_1",
    //   fullName: "David Mensah",
    //   phone: "+233240000001",
    // },
    school: {
      id: "school_1",
      name: "Greenfield Academy",
    },
    enrollmentStatus: "VERIFIED",
    createdAt: new Date(Date.now() - 10368000000).toISOString(),
  },
];

export const childrenHandlers = [
  // GET /children
  http.get("/children", async () => {
    await delay(800);
    return HttpResponse.json({ children: MOCK_CHILDREN });
  }),

  // GET /children/:id
  http.get("/children/:id", async ({ params }: any) => {
    await delay(500);
    const child = MOCK_CHILDREN.find((c) => c.id === params.id);
    if (!child) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(child);
  }),

  // POST /children
  http.post("/children", async ({ request }: any) => {
    await delay(1000);
    const body = (await request.json()) as any;

    const hasSecondaryGuardian = body.secondaryGuardian?.phone;

    const newChild = {
      id: `child_${Math.random().toString(36).substr(2, 9)}`,
      safepickId: `SP-2026-${Math.floor(Math.random() * 90000) + 10000}`,
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth,
      grade: body.grade,
      photoUrl: body.photo || null,
      parentId: "user_parent_1",
      parent: MOCK_PARENT,
      secondaryGuardianId: hasSecondaryGuardian ? "user_delegate_1" : undefined,
      secondaryGuardian: hasSecondaryGuardian ? {
        id: "user_delegate_1",
        fullName: "David Mensah",
        phone: body.secondaryGuardian.phone,
      } : null,
      secondaryGuardianStatus: hasSecondaryGuardian ? "PENDING_INVITE" : "NONE",
      mode: hasSecondaryGuardian ? "FULL" : "LIMITED",
      school: null,
      enrollmentStatus: "PENDING_SCHOOL",
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json({ child: newChild }, { status: 201 });
  }),

  // PATCH /children/:id
  http.patch("/children/:id", async ({ params, request }: any) => {
    await delay(800);
    const body = (await request.json()) as any;
    const child = MOCK_CHILDREN.find((c) => c.id === params.id);
    if (!child) return new HttpResponse(null, { status: 404 });
    
    return HttpResponse.json({ ...child, ...body });
  }),

  // DELETE /children/:id
  http.delete("/children/:id", async () => {
    await delay(800);
    return HttpResponse.json({ message: "Child removed successfully" });
  }),

  // GET /users/lookup?phone
  http.get("/users/lookup", async ({ request }: any) => {
    await delay(600);
    const url = new URL(request.url);
    const phone = url.searchParams.get("phone");

    if (phone === "+233240000001" || phone === "0240000001") {
      return HttpResponse.json({
        found: true,
        user: {
          id: "user_delegate_1",
          fullName: "David Mensah",
          phone: "+233240000001",
        },
      });
    }

    return HttpResponse.json({ found: false, user: null });
  }),
];
