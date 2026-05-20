import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schoolsService } from "@/services/schools.service";
import { useAuthStore } from "@/stores/auth.store";
import { useDebouncedValue } from "./useDebouncedValue";
import { CreateSchoolRequest, UpdateSchoolRequest } from "@/types/schools.types";
import { queryKeys } from "@/lib/queryKeys";

export function useSchoolsList() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.schools,
    queryFn: () => schoolsService.listSchools(),
    enabled: !!accessToken,
    staleTime: 60000,
  });
}

export function useSchoolSearch(query: string) {
  const { accessToken } = useAuthStore();
  const debouncedQuery = useDebouncedValue(query, 300);
  return useQuery({
    queryKey: queryKeys.schoolSearch(debouncedQuery),
    queryFn: () => schoolsService.searchSchoolsV2(debouncedQuery),
    enabled: !!accessToken && debouncedQuery.length >= 2,
    staleTime: 60000,
  });
}

export function useSchool(id: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.school(id),
    queryFn: () => schoolsService.getSchool(id),
    enabled: !!id && !!accessToken,
    staleTime: 30000,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSchoolRequest) => schoolsService.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSchoolRequest }) =>
      schoolsService.updateSchool(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
      queryClient.invalidateQueries({ queryKey: queryKeys.school(id) });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsService.deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schools });
    },
  });
}

export function useLinkChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, childId }: { schoolId: string; childId: string }) =>
      schoolsService.linkChild(schoolId, childId),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school(schoolId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.children });
    },
  });
}

export function useUnlinkChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, childId }: { schoolId: string; childId: string }) =>
      schoolsService.unlinkChild(childId),
    onSuccess: (_, { schoolId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.school(schoolId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.children });
    },
  });
}
