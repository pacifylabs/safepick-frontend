"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQrToken } from "@/hooks/usePickupRequest";
import { formatDistanceToNow, isPast, parseISO } from "date-fns";

interface QrOverlayProps {
  authorizationId: string;
  onClose: () => void;
}

export function QrOverlay({ authorizationId, onClose }: QrOverlayProps) {
  const { data: qrToken, isLoading, isError, refetch } = useQrToken(authorizationId);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!qrToken?.expiresAt) return;

    const timer = setInterval(() => {
      const expiry = parseISO(qrToken.expiresAt);
      if (isPast(expiry)) {
        setTimeLeft("Expired");
        refetch();
      } else {
        setTimeLeft(formatDistanceToNow(expiry, { addSuffix: true }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [qrToken, refetch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0B1A2C] flex flex-col items-center justify-center p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-semibold text-white">
            Pickup QR Code
          </h2>
          <p className="font-body text-white/40">
            Show this at the school gate to verify pickup
          </p>
        </div>

        <div className="relative w-full aspect-square bg-white rounded-[32px] p-8 flex items-center justify-center shadow-2xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-[#0FA37F] animate-spin" />
                <p className="font-body text-navy/40 text-sm">Generating token...</p>
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-center px-4"
              >
                <AlertCircle className="w-12 h-12 text-[#D85A30]" />
                <p className="font-body text-navy/60 text-sm">
                  Failed to load QR code. Authorization may not be active.
                </p>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 text-[#0FA37F] font-medium text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </motion.div>
            ) : qrToken ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG
                    value={qrToken.qrPayload}
                    size={240}
                    level="H"
                    includeMargin={false}
                    fgColor="#0B1A2C"
                  />
                </div>
                <div className="text-center">
                  <p className="font-display text-xl font-bold text-navy">
                    {qrToken.childName}
                  </p>
                  <p className="font-body text-navy/40 text-sm">
                    Delegate: {qrToken.delegateName}
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {!isLoading && !isError && qrToken && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#0FA37F] animate-pulse" />
              <p className="font-body text-white/60 text-sm">
                Expires {timeLeft}
              </p>
            </div>
            <p className="font-body text-white/20 text-[0.7rem] uppercase tracking-widest">
              Refreshes automatically
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
