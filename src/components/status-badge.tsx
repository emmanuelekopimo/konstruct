import { STATUS_LABEL, type PlanStatus } from "@/lib/breakdown";

export function StatusBadge({ status }: { status: PlanStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}
