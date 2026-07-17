import type {
  Contract,
  ContractMetadata,
  ReviewDecision,
  ReviewerComment,
  Risk,
} from "@/types/contract";
import { mockContract } from "@/services/mock-contract";
// import { apiClient } from "./client";

// Placeholder API layer. Every function is where the real FastAPI call will
// live. Keep the return types identical so components need no changes when
// wiring is swapped from mock to network.

const delay = <T>(v: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(v), ms));

export async function uploadContract(file: File): Promise<{ contractId: string }> {
  // return apiClient.post("/contracts/upload", formData).then(r => r.data)
  void file;
  return delay({ contractId: mockContract.id }, 800);
}

export async function getContract(contractId: string): Promise<Contract> {
  // return apiClient.get(`/contracts/${contractId}`).then(r => r.data)
  void contractId;
  return delay(mockContract, 300);
}

export async function updateContractMetadata(
  contractId: string,
  metadata: Partial<ContractMetadata>,
): Promise<ContractMetadata> {
  // return apiClient.patch(`/contracts/${contractId}/metadata`, metadata).then(r => r.data)
  void contractId;
  return delay({ ...mockContract.metadata, ...metadata });
}

export async function updateRisk(contractId: string, risk: Partial<Risk> & { id: string }): Promise<Risk> {
  // return apiClient.patch(`/contracts/${contractId}/risks/${risk.id}`, risk).then(r => r.data)
  void contractId;
  const existing = mockContract.risks.find((r) => r.id === risk.id)!;
  return delay({ ...existing, ...risk });
}

export async function addComment(
  contractId: string,
  comment: Omit<ReviewerComment, "id" | "createdAt">,
): Promise<ReviewerComment> {
  // return apiClient.post(`/contracts/${contractId}/comments`, comment).then(r => r.data)
  void contractId;
  return delay({
    ...comment,
    id: `cm-${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}

export async function submitReviewDecision(
  contractId: string,
  payload: { decision: ReviewDecision; comments: string; checklist: Record<string, boolean> },
): Promise<{ ok: true }> {
  // return apiClient.post(`/contracts/${contractId}/decision`, payload).then(r => r.data)
  void contractId;
  void payload;
  return delay({ ok: true as const }, 600);
}
