import HistoryPageContent, { metadata } from "@/components/mpl/HistoryPageContent";

export { metadata };

export default function HistoryPage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <HistoryPageContent {...props} />;
}
