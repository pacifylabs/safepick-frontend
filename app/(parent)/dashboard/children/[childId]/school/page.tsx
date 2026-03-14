"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  Building,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  Share2,
} from "lucide-react";
import { useChild } from "@/hooks/useChildren";
import {
  useSchoolSearch,
  useLinkChildToSchool,
  useRequestSchool,
} from "@/hooks/useSchools";
import { SchoolSearchResult } from "@/components/schools/SchoolSearchResult";
import { AdoptionProgress } from "@/components/schools/AdoptionProgress";
import { Button } from "@/components/ui/Button";
import { School, RequestSchoolPayload } from "@/types/schools.types";

type PageState = "SEARCH" | "REQUEST_FORM" | "CONFIRMED";

const RequestFormSchema = z.object({
  schoolName: z.string().min(3, "Enter the school name"),
  address: z.string().min(5, "Enter the school address"),
  city: z.string().min(2, "Enter the city"),
  country: z.string().min(2, "Enter the country"),
});

type RequestFormData = z.infer<typeof RequestFormSchema>;

export default function SchoolLinkingPage() {
  const { childId } = useParams();
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("SEARCH");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    type: "LINKED" | "REQUESTED";
    schoolName: string;
    requestCount?: number;
    threshold?: number;
  } | null>(null);

  const { data: child } = useChild(childId as string);
  const { data: searchResults, isLoading: isSearching } = useSchoolSearch(searchQuery);
  const { mutate: linkSchool, isPending: isLinking } = useLinkChildToSchool();
  const { mutate: requestSchool, isPending: isRequesting } = useRequestSchool();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(RequestFormSchema),
  });

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleConfirmLink = () => {
    if (!selectedSchool) return;

    linkSchool(
      { childId: childId as string, schoolId: selectedSchool.id },
      {
        onSuccess: (data) => {
          if (data.enrollmentStatus === "PENDING_VERIFICATION") {
            setConfirmationData({
              type: "LINKED",
              schoolName: selectedSchool.name,
            });
            setPageState("CONFIRMED");
          } else if (data.enrollmentStatus === "SCHOOL_NOT_ON_SAFEPICK") {
            setConfirmationData({
              type: "REQUESTED",
              schoolName: selectedSchool.name,
              requestCount: data.requestCount,
              threshold: data.threshold,
            });
            setPageState("CONFIRMED");
          }
        },
      }
    );
  };

  const handleConfirmAdoption = () => {
    if (!selectedSchool) return;

    requestSchool(
      { childId: childId as string, schoolId: selectedSchool.id },
      {
        onSuccess: (data) => {
          setConfirmationData({
            type: "REQUESTED",
            schoolName: selectedSchool.name,
            requestCount: data.requestCount,
            threshold: data.threshold,
          });
          setPageState("CONFIRMED");
        },
      }
    );
  };

  const handleManualSubmit = (data: RequestFormData) => {
    const payload: RequestSchoolPayload = {
      childId: childId as string,
      schoolName: data.schoolName,
      schoolAddress: data.address,
      city: data.city,
      country: data.country,
    };

    requestSchool(payload, {
      onSuccess: (res) => {
        setConfirmationData({
          type: "REQUESTED",
          schoolName: data.schoolName,
          requestCount: res.requestCount,
          threshold: res.threshold,
        });
        setPageState("CONFIRMED");
      },
    });
  };

  const handleShare = () => {
    const shareText = `Join me in requesting SafePick at ${confirmationData?.schoolName}! Once enough parents request it, the school can start using it for safer child pickups.`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      navigator
        .share({
          title: "Request SafePick",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {
          // Fallback to clipboard if share fails or is cancelled
          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
          alert("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-6 font-body">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-6 text-[0.875rem]">
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push("/dashboard")}
        >
          Home
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push("/dashboard")}
        >
          My Children
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span
          className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]"
          onClick={() => router.push(`/dashboard/children/${childId}`)}
        >
          {child?.fullName || "Child"}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#0B1A2C] font-medium">Link School</span>
      </div>

      <AnimatePresence mode="wait">
        {pageState === "SEARCH" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">
              LINK A SCHOOL
            </p>
            <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-1">
              Find your child's school
            </h2>
            <p className="text-[0.875rem] text-[#6B7280] mb-6">
              Search for the school by name or location.
            </p>

            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search school name e.g. Greenfield Academy"
                className="w-full pl-10 pr-4 py-3 bg-[#F9F9F8] border border-black/[0.08] rounded-xl text-[0.875rem] text-[#0B1A2C] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-white outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {selectedSchool ? (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-[#F9F9F8] rounded-xl p-4 border border-black/[0.06] flex items-start gap-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-[#E1F5EE] flex-shrink-0 flex items-center justify-center">
                    <Building className="text-[#0FA37F] w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.9rem] font-semibold text-[#0B1A2C] mb-0.5 truncate">
                      {selectedSchool.name}
                    </p>
                    <p className="text-[0.78rem] text-[#6B7280] truncate">
                      {selectedSchool.address}, {selectedSchool.city}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {selectedSchool.status === "ACTIVE" ? (
                        <span className="bg-[#E1F5EE] text-[#0F6E56] rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                          On SafePick
                        </span>
                      ) : (
                        <span className="bg-[#FAEEDA] text-[#BA7517] rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSchool(null)}
                    className="p-1 hover:bg-[#F2F0EB] rounded-lg transition-colors absolute top-3 right-3"
                  >
                    <X className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>

                {selectedSchool.status === "ACTIVE" ? (
                  <Button
                    variant="primary"
                    className="w-full h-12 rounded-xl mt-4"
                    loading={isLinking}
                    onClick={handleConfirmLink}
                  >
                    Link {child?.fullName?.split(" ")[0]} to {selectedSchool.name}
                  </Button>
                ) : (
                  <>
                    <div className="mt-4 bg-[#FAEEDA] border border-[#EF9F27]/30 rounded-xl p-4 mb-4 flex gap-3 items-start">
                      <AlertCircle className="w-4 h-4 text-[#BA7517] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.82rem] font-medium text-[#0B1A2C] mb-1">
                          {selectedSchool.name} hasn't joined SafePick yet.
                        </p>
                        <p className="text-[0.78rem] text-[#6B7280] leading-relaxed">
                          {selectedSchool.pendingRequests || 0} parents have already
                          requested this school. Request it and we'll notify you
                          when they join.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full h-12 rounded-xl"
                      loading={isRequesting}
                      onClick={handleConfirmAdoption}
                    >
                      Request SafePick at {selectedSchool.name}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {isSearching ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse bg-[#F2F0EB] rounded-xl"
                    />
                  ))
                ) : searchResults?.length === 0 && searchQuery.length >= 3 ? (
                  <div className="mt-4 flex flex-col items-center text-center py-6">
                    <Building className="w-8 h-8 text-[#6B7280]/40 mb-2" />
                    <p className="text-[0.875rem] text-[#6B7280]">
                      No schools found for "{searchQuery}"
                    </p>
                    <p className="text-[0.78rem] text-[#6B7280]/60 mt-1 mb-4">
                      You can still request SafePick at your school.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPageState("REQUEST_FORM")}
                    >
                      Request my school
                    </Button>
                  </div>
                ) : (
                  searchResults?.map((school) => (
                    <SchoolSearchResult
                      key={school.id}
                      school={school}
                      onSelect={handleSchoolSelect}
                    />
                  ))
                )}
              </div>
            )}

            {!selectedSchool && (
              <div className="mt-4 pt-4 border-t border-[#F2F0EB] flex items-center justify-between">
                <p className="text-[0.82rem] text-[#6B7280]">
                  Can't find your school?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPageState("REQUEST_FORM")}
                >
                  Add it manually
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {pageState === "REQUEST_FORM" && (
          <motion.div
            key="request"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm"
          >
            <button
              onClick={() => setPageState("SEARCH")}
              className="flex items-center text-[0.82rem] text-[#6B7280] hover:text-[#0B1A2C] mb-6 transition-colors"
            >
              ← Back to search
            </button>

            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">
              REQUEST A SCHOOL
            </p>
            <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-1">
              Add your school
            </h2>
            <p className="text-[0.875rem] text-[#6B7280] mb-6">
              We'll reach out to them once enough parents request it.
            </p>

            <form onSubmit={handleSubmit(handleManualSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">
                  School name
                </label>
                <input
                  {...register("schoolName")}
                  placeholder="Sunrise Montessori"
                  className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-white outline-none transition-all"
                />
                {errors.schoolName && (
                  <p className="text-coral text-[0.74rem] mt-1">
                    {errors.schoolName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">
                  Street address
                </label>
                <input
                  {...register("address")}
                  placeholder="42 Broad Street"
                  className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-white outline-none transition-all"
                />
                {errors.address && (
                  <p className="text-coral text-[0.74rem] mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">
                    City
                  </label>
                  <input
                    {...register("city")}
                    placeholder="Abuja"
                    className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-white outline-none transition-all"
                  />
                  {errors.city && (
                    <p className="text-coral text-[0.74rem] mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.78rem] font-medium text-[#0B1A2C]/70">
                    Country
                  </label>
                  <input
                    {...register("country")}
                    placeholder="Nigeria"
                    className="w-full bg-[#F9F9F8] border border-black/[0.08] rounded-xl px-4 py-3 text-[0.875rem] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15 focus:bg-white outline-none transition-all"
                  />
                  {errors.country && (
                    <p className="text-coral text-[0.74rem] mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#E1F5EE] border border-[#0FA37F]/20 rounded-xl p-3 mt-2 flex gap-2 items-start">
                <Info className="w-4 h-4 text-[#0FA37F] flex-shrink-0 mt-0.5" />
                <p className="text-[0.78rem] text-[#0F6E56] leading-relaxed">
                  Once enough parents request the same school, the school admin
                  will automatically receive an onboarding link.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="h-12 rounded-xl mt-6"
                loading={isRequesting}
              >
                Submit school request
              </Button>
            </form>
          </motion.div>
        )}

        {pageState === "CONFIRMED" && confirmationData && (
          <motion.div
            key="confirmed"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-sm flex flex-col items-center text-center"
          >
            {confirmationData.type === "LINKED" ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[#0FA37F]" />
                </div>
                <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-2">
                  Request sent!
                </h2>
                <p className="text-[0.875rem] text-[#6B7280] max-w-[320px] leading-relaxed mb-6">
                  {confirmationData.schoolName} has received your enrollment
                  request for {child?.fullName}. You'll be notified once they
                  verify it.
                </p>
                <div className="bg-[#F9F9F8] rounded-xl p-4 w-full mb-6 flex items-center gap-3">
                  <Building className="w-5 h-5 text-[#0FA37F]" />
                  <div className="text-left">
                    <p className="font-medium text-[#0B1A2C]">
                      {confirmationData.schoolName}
                    </p>
                    <p className="text-[0.78rem] text-[#6B7280]">
                      Enrollment pending verification
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  className="h-12 rounded-xl"
                  onClick={() =>
                    router.push(`/dashboard/children/${childId}`)
                  }
                >
                  Back to {child?.fullName?.split(" ")[0]}'s profile
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#FAEEDA] flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-[#BA7517]" />
                </div>
                <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C] mb-2">
                  Request submitted!
                </h2>
                <p className="text-[0.875rem] text-[#6B7280] max-w-[320px] leading-relaxed mb-6">
                  We've logged your request for {confirmationData.schoolName}.
                  We'll send you a notification as soon as they join SafePick.
                </p>
                <div className="bg-[#F9F9F8] rounded-xl p-4 w-full mb-6">
                  <AdoptionProgress
                    requestCount={confirmationData.requestCount || 0}
                    threshold={confirmationData.threshold || 10}
                    schoolName={confirmationData.schoolName}
                  />
                </div>
                <div className="bg-[#F9F9F8] rounded-xl p-4 w-full mb-6 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[0.82rem] font-medium text-[#0B1A2C] mb-0.5">
                      Speed it up
                    </p>
                    <p className="text-[0.72rem] text-[#6B7280]">
                      Share SafePick with other parents
                    </p>
                  </div>
                  <Button variant="primary" size="sm" className="h-9 rounded-lg" onClick={handleShare}>
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </>
            )}
            <Button
              variant="ghost"
              fullWidth
              className="mt-2"
              onClick={() => router.push("/dashboard")}
            >
              Go to dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
