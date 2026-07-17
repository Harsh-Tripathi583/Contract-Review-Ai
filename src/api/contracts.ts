import type {
  Contract,
  ContractMetadata,
  ReviewDecision,
  ReviewerComment,
  Risk,
} from "@/types/contract";
import { apiClient } from "./client";

// Placeholder API layer. Every function is where the real FastAPI call will
// live. Keep the return types identical so components need no changes when
// wiring is swapped from mock to network.

export async function uploadContract(file: File): Promise<{ contractId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient
    .post<{ contractId: string }>("/contracts/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data);
}

export async function getContract(contractId: string): Promise<Contract> {
  return apiClient.get<Contract>(`/contracts/${contractId}`).then((r) => r.data);
}

export async function updateContractMetadata(
  contractId: string,
  metadata: Partial<ContractMetadata>,
): Promise<{ ok: true }> {
  return apiClient
    .patch<{ ok: true }>(`/contracts/${contractId}/metadata`, metadata)
    .then((r) => r.data);
}

export async function updateRisk(
  contractId: string,
  risk: Partial<Risk> & { id: string },
): Promise<{ ok: true }> {
  return apiClient
    .patch<{ ok: true }>(`/contracts/${contractId}/risks/${risk.id}`, risk)
    .then((r) => r.data);
}

export async function addComment(
  contractId: string,
  comment: Omit<ReviewerComment, "id" | "createdAt">,
): Promise<ReviewerComment> {
  return apiClient
    .post<ReviewerComment>(`/contracts/${contractId}/comments`, comment)
    .then((r) => r.data);
}

export async function submitReviewDecision(
  contractId: string,
  payload: { decision: ReviewDecision; comments: string; checklist: Record<string, boolean> },
): Promise<{ ok: true }> {
  return apiClient
    .post<{ ok: true }>(`/contracts/${contractId}/decision`, payload)
    .then((r) => r.data);
}
