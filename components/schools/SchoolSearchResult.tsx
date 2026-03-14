"use client";

import React from "react";
import { Building } from "lucide-react";
import { School } from "@/types/schools.types";

interface SchoolSearchResultProps {
  school: School;
  onSelect: (school: School) => void;
}

export const SchoolSearchResult: React.FC<SchoolSearchResultProps> = ({
  school,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(school)}
      className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border border-transparent hover:bg-[#F9F9F8] border-black/[0.06] transition-all duration-150 group"
    >
      <div
        className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${
          school.status === "ACTIVE" ? "bg-[#E1F5EE] text-[#0FA37F]" : "bg-[#FAEEDA] text-[#BA7517]"
        }`}
      >
        <Building className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-body text-[0.875rem] font-medium text-[#0B1A2C] truncate group-hover:text-[#0FA37F] transition-colors">
          {school.name}
        </p>
        <p className="font-body text-[0.72rem] text-[#6B7280] mt-0.5">
          {school.address} · {school.city}
        </p>
      </div>

      <div>
        {school.status === "ACTIVE" ? (
          <span className="bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium whitespace-nowrap">
            On SafePick
          </span>
        ) : school.status === "PENDING_ONBOARDING" ? (
          <span className="bg-[#FAEEDA] text-[#BA7517] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium whitespace-nowrap">
            Coming soon
          </span>
        ) : (
          <span className="bg-[#F2F0EB] text-[#6B7280] rounded-full px-2.5 py-1 font-body text-[0.7rem] font-medium whitespace-nowrap">
            Not registered
          </span>
        )}
      </div>
    </div>
  );
};
