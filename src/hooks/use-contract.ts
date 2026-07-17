import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/contracts";
import type { ContractMetadata, ReviewDecision, ReviewerComment, Risk } from "@/types/contract";

export const contractQueryKey = (id: string) => ["contract", id] as const;

export const contractQueryOptions = (id: string) =>
  queryOptions({
    queryKey: contractQueryKey(id),
    queryFn: () => api.getContract(id),
  });

export const useContract = (id: string) => useQuery(contractQueryOptions(id));

export const useUpdateMetadata = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ContractMetadata>) => api.updateContractMetadata(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractQueryKey(id) }),
  });
};

export const useUpdateRisk = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (risk: Partial<Risk> & { id: string }) => api.updateRisk(id, risk),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractQueryKey(id) }),
  });
};

export const useAddComment = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: Omit<ReviewerComment, "id" | "createdAt">) => api.addComment(id, c),
    onSuccess: () => qc.invalidateQueries({ queryKey: contractQueryKey(id) }),
  });
};

export const useSubmitDecision = (id: string) =>
  useMutation({
    mutationFn: (p: {
      decision: ReviewDecision;
      comments: string;
      checklist: Record<string, boolean>;
    }) => api.submitReviewDecision(id, p),
  });

export const useUploadContract = () =>
  useMutation({ mutationFn: (file: File) => api.uploadContract(file) });
