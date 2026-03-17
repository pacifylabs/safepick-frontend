"use client";

import { useParams, useRouter } from "next/navigation";
import { PickupRequestModal } from "@/components/pickup/PickupRequestModal";

export default function PickupDeepLinkPage() {
  const params = useParams();
  const router = useRouter();
  const pickupRequestId = params.id as string;

  if (!pickupRequestId) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1A2C]">
      <PickupRequestModal
        pickupRequestId={pickupRequestId}
        onClose={() => router.push("/dashboard")}
      />
    </div>
  );
}
