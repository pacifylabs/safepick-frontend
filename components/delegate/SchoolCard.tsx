"use client";

import { Building, Navigation } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface SchoolCardProps {
  school: {
    id: string;
    name: string;
    address: string;
    gateInstructions: string | null;
    children: Array<{ childName: string; authorizationId: string }>;
  };
}

const SchoolCard = ({ school }: SchoolCardProps) => {
  const handleMapClick = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(school.address)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-[14px] border border-[rgba(11,26,44,0.07)] overflow-hidden">
      <div className="bg-[#0B1A2C] px-4 py-3.5 md:px-5 md:py-4 flex items-center gap-3">
        <div className="w-[38px] h-[38px] bg-white/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
          <Building className="w-5 h-5 stroke-[#0FA37F]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-fraunces text-[0.95rem] md:text-[1rem] font-semibold text-white truncate">
            {school.name}
          </p>
          <p className="font-dm-sans text-[0.72rem] text-white/45 mt-[2px] truncate">
            {school.address}
          </p>
        </div>
        <div
          onClick={handleMapClick}
          className="w-[36px] h-[36px] bg-white/10 rounded-[10px] flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <Navigation className="w-4 h-4 stroke-white opacity-60" />
        </div>
      </div>

      <div className="p-4 space-y-3 md:space-y-4">
        <div>
          <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.08em] text-[#6B7280] mb-2">
            GATE INSTRUCTIONS
          </p>
          <div className="bg-[#F2F0EB] rounded-[10px] p-3">
            <p className="font-dm-sans text-[0.78rem] md:text-[0.8rem] text-[#0B1A2C] leading-relaxed">
              {school.gateInstructions || 'Report to main gate, show QR.'}
            </p>
          </div>
        </div>
        <div>
          <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.08em] text-[#6B7280] mb-2">
            CHILDREN HERE
          </p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {school.children.map(child => (
              <div
                key={child.authorizationId}
                className="bg-[#E1F5EE] rounded-full px-3 py-[5px] flex items-center gap-[6px]"
              >
                <div className="w-[20px] h-[20px] bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-[0.58rem] font-medium">
                  {getInitials(child.childName)}
                </div>
                <span className="font-dm-sans text-[0.73rem] text-[#0F6E56] font-medium">
                  {child.childName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
