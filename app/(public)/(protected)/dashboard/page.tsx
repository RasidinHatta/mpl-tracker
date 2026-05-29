import DashboardPageContent, { metadata } from "@/components/mpl/DashboardPageContent";

export { metadata };

export default function DashboardPage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <DashboardPageContent {...props} />;
}
