"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X, MapPin, Phone, User } from "lucide-react";
import { SosAlert } from "@/types/emergency.types";
import { Button } from "@/components/ui/Button";

interface SosAlertModalProps {
  alert: SosAlert;
  onClose: () => void;
}

export const SosAlertModal: React.FC<SosAlertModalProps> = ({ alert, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1A0707]/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#1A0707] border-2 border-[#D85A30] rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-2xl shadow-coral/20"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-[#D85A30] flex items-center justify-center text-white"
              >
                <ShieldAlert className="w-8 h-8" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white font-display uppercase tracking-tight">SOS ALERT</h2>
                <p className="text-[#D85A30] font-bold text-sm uppercase tracking-widest">Immediate action required</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold">
                  {alert.childName[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{alert.childName}</p>
                  <p className="text-white/40 text-sm">Target of emergency</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-bold">
                  {alert.delegateName[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{alert.delegateName}</p>
                  <p className="text-white/40 text-sm">Delegate at location</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0FA37F]/20 flex items-center justify-center text-[#0FA37F] flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-bold mb-1">Live Location Sharing</p>
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                  Delegate is broadcasting their coordinates. Track them immediately on the map.
                </p>
                <Button 
                  variant="primary" 
                  fullWidth 
                  className="bg-[#0FA37F] hover:bg-[#0FA37F]/90 text-white border-none h-12"
                  onClick={() => window.open(`https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`, '_blank')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
            <Button 
              variant="danger" 
              fullWidth 
              className="bg-[#D85A30] text-white border-none h-14 text-lg font-bold"
              onClick={() => window.open('tel:112')}
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency
            </Button>
            <Button 
              variant="ghost" 
              fullWidth 
              className="text-white/60 hover:text-white h-14"
              onClick={onClose}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
