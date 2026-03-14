import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolsService } from "../services/schools.service";
import { useDebouncedValue } from "./useDebouncedValue";
import { RequestSchoolPayload } from "../types/schools.types";

export function useSchoolSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, 400);

  return useQuery({
    queryKey: ["schools", "search", debouncedQuery],
    queryFn: () => schoolsService.searchSchools(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000,
  });
}

export function useLinkChildToSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, schoolId }: { childId: string; schoolId: string }) =>
      schoolsService.linkChildToSchool(childId, schoolId),
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
  });
}

export function useRequestSchool() {
  return useMutation({
    mutationFn: (data: RequestSchoolPayload) => schoolsService.requestSchool(data),
  });
}

export function useEnrollmentStatus(childId: string) {
  return useQuery({
    queryKey: ["enrollment", childId],
    queryFn: () => schoolsService.getEnrollmentStatus(childId),
    enabled: !!childId,
    refetchInterval: 30000,
  });
}
