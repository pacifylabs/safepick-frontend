import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { ClockOutPayload } from "@/types/attendance.types";

export const useAttendanceByChild = (childId: string, month: string) => {
  return useQuery({
    queryKey: ["attendance", childId, month],
    queryFn: () => attendanceService.getAttendanceByChild(childId, month),
    enabled: !!childId && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes - occasionally changes
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClockOutPayload) => attendanceService.clockOut(payload),
    onSuccess: () => {
      // Invalidate both attendance and pickup request data
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["pickup-requests"] });
    },
  });
};
