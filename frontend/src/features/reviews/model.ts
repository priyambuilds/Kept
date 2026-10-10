// A group review of a failed photo 2 (G1–G3), whichever backend it comes from.

export type ReviewStatus = "pending" | "approved" | "rejected" | "expired";
export interface ReviewFacts {
  id: string;
  oathId: string;
  /** Who asked for the review. */
  by: string;
  dayIndex: number;
  objectId: number;
  gesture: "thumbs_up" | "victory" | "open_palm";
  /** wallet → approve? */
  votes: Record<string, boolean>;
  /** Everyone except the requester. */
  voters: string[];
  createdAt: number;
  expiresAt: number;
  status: ReviewStatus;
}
