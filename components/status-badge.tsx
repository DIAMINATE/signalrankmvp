const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600" },
  icp_generated: { label: "ICP Generated", className: "bg-blue-50 text-blue-700" },
  icp_verified: { label: "ICP Verified", className: "bg-amber-50 text-amber-700" },
  leads_ranked: { label: "Leads Ranked", className: "bg-emerald-50 text-emerald-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, className: "bg-neutral-100 text-neutral-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
