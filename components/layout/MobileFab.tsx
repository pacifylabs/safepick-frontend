"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export function MobileFab() {
  const router = useRouter();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={() => router.push("/dashboard/children/new")}
      className="md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-teal shadow-lg flex items-center justify-center text-white z-40"
    >
      <Plus size={24} />
    </motion.button>
  );
}
