import type { LucideIcon } from "lucide-react";

export type FindingType =
  | "person"
  | "place"
  | "organization"
  | "document"
  | "social"
  | "other";

export interface Finding {
  id: string;
  type: FindingType;
  title: string;
  content: string;
  sourceQuery: string;
  icon: LucideIcon;
}
