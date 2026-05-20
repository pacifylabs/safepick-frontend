"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Plus, Search, ChevronRight, MapPin, Phone, Mail, CheckCircle, XCircle, ExternalLink, FileText } from "lucide-react";
import { useSchoolsList, useSchoolSearch } from "@/hooks/useSchoolsManagement";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function SchoolsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 300);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "SCHOOL_ADMIN";

  const { data: schools = [], isLoading } = useSchoolsList();
  const { data: searchResults = [], isLoading: searching } = useSchoolSearch(searchQuery);

  const displaySchools = searchQuery.trim().length >= 2 ? searchResults : schools;
  const loading = searchQuery.trim().length >= 2 ? searching : isLoading;

  return (
    <div className="p-6 max-w-8xl font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">Schools</h1>
          <p className="text-[0.875rem] text-[var(--text-secondary)]">Manage schools and their enrollment.</p>
        </div>
        <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => router.push("/dashboard/schools/requests")}>
                <FileText className="w-4 h-4 mr-2" />
                Requests
              </Button>
            )}
            {isAdmin ? (
              <Button variant="primary" onClick={() => router.push("/dashboard/schools/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push("/dashboard/schools/requests")}>
                  <FileText className="w-4 h-4 mr-2" />
                  My Requests
                </Button>
                <Button variant="primary" onClick={() => router.push("/dashboard/schools/request")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Request a School
                </Button>
              </div>
            )}
          </div>
      </div>

      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">Schools</span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Search schools by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--bg-surface)] animate-pulse rounded-2xl border border-[var(--border)]" />
          ))}
        </div>
      ) : displaySchools.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-[#4F46E5]" />
          </div>
          <h3 className="font-body text-[1.1rem] font-semibold text-[var(--text-primary)] mb-2">
            {searchQuery.trim().length >= 2 ? "No schools found" : "No schools yet"}
          </h3>
          <p className="font-body text-[0.875rem] text-[var(--text-secondary)] max-w-[320px] leading-relaxed mb-6">
            {searchQuery.trim().length >= 2
              ? "Try a different search term."
              : isAdmin
                ? "Add your first school to start managing enrollments."
                : "No schools are registered yet."}
          </p>
          {searchQuery.trim().length < 2 && isAdmin && (
            <Button variant="primary" onClick={() => router.push("/dashboard/schools/new")}>
              Add School
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displaySchools.map((school) => (
            <div
              key={school.id}
              onClick={() => router.push(`/dashboard/schools/${school.id}`)}
              className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-5 cursor-pointer hover:border-[var(--border-strong)] transition-all flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[1rem] font-semibold text-[var(--text-primary)]">{school.name}</h3>
                  {school.verified ? (
                    <span className="inline-flex items-center gap-1 bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FAEEDA] text-[#BA7517] rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-[0.8rem] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {school.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {school.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {school.email}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 hidden md:block" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
