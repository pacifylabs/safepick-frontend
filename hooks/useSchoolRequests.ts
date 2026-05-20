import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolRequestsService } from "@/services/schoolRequests.service";
import { useAuthStore } from "@/stores/auth.store";
import { queryKeys } from "@/lib/queryKeys";
import {
  RequestSchoolPayload,
  ListRequestsQuery,
  ReviewRequestPayload,
} from "@/types/school-requests.types";

export function useSchoolRequestsList(query: ListRequestsQuery) {
  const { accessToken } = useAuthStore();
  const queryKey = JSON.stringify({ status: query.status, page: query.page, limit: query.limit });
  return useQuery({
    queryKey: queryKeys.schoolRequestsList(queryKey),
    queryFn: () => schoolRequestsService.list(query),
    enabled: !!accessToken,
    staleTime: 30000,
  });
}

export function useSchoolRequest(id: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.schoolRequest(id),
    queryFn: () => schoolRequestsService.get(id),
    enabled: !!id && !!accessToken,
    staleTime: 30000,
  });
}

export function useSubmitSchoolRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RequestSchoolPayload) => schoolRequestsService.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schoolRequests });
    },
  });
}

export function useReviewSchoolRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewRequestPayload }) =>
      schoolRequestsService.review(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schoolRequests });
    },
  });
}

export function useCancelSchoolRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolRequestsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schoolRequests });
    },
  });
}
