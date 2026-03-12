import { STATIC_PROJECT_IDS } from "@/lib/demo-data";

export function generateStaticParams() {
  return STATIC_PROJECT_IDS.map((id) => ({ id }));
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
