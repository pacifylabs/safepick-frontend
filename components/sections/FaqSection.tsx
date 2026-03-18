"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Who can be a delegate?",
    answer: "Anyone you trust — a driver, nanny, grandparent, or family friend. They go through identity verification before being approved.",
  },
  {
    question: "What happens if I miss the pickup notification?",
    answer: "After a configurable timeout, your secondary emergency guardian is automatically notified via SMS or WhatsApp.",
  },
  {
    question: "Can I revoke a delegate's access immediately?",
    answer: "Yes — you can suspend or permanently revoke any delegate's access instantly from the app, even mid-pickup.",
  },
  {
    question: "Does the school need to install anything?",
    answer: "No. The school gate app works in any browser on a tablet or computer. No installation required.",
  },
  {
    question: "Is my child's data secure?",
    answer: "All data is encrypted at rest and in transit. KYC documents are stored with bank-grade encryption and only accessible to authorized parties.",
  },
  {
    question: "What if there's no internet at the school gate?",
    answer: "The OTP fallback works via SMS and does not require an internet connection on the delegate's device.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border)] py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left cursor-pointer group"
      >
        <span className="font-body text-[0.9375rem] font-medium text-[var(--text-primary)] group-hover:text-[#0FA37F] transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[var(--text-muted)]"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="font-body text-[0.875rem] text-[var(--text-secondary)] leading-relaxed pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="py-24 bg-[var(--bg-surface)]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-4">
            FAQ
          </p>
          <h2 className="font-display text-[3rem] font-semibold text-[var(--text-primary)]">
            Common questions
          </h2>
        </div>

        {/* FAQ List */}
        <div className="max-w-[680px] mx-auto">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
