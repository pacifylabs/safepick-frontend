import { useMutation, useQuery } from "@tanstack/react-query";
import { delegateKycService } from "@/services/delegateKyc.service";
import { SubmitKycRequest } from "@/types/delegateKyc.types";

export function useSubmitKyc() {
  return useMutation({
    mutationFn: (data: SubmitKycRequest) => delegateKycService.submitKyc(data),
  });
}

export function useKycStatus(inviteToken: string) {
  return useQuery({
    queryKey: ["delegate-kyc", "status", inviteToken],
    queryFn: () => delegateKycService.checkKycStatus({ inviteToken }),
    enabled: inviteToken.length > 0,
    retry: false,
    staleTime: 30000,
  });
}
