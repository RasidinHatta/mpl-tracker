import SchedulePageContent, { metadata } from "@/components/mpl/SchedulePageContent";

export { metadata };

export default function SchedulePage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <SchedulePageContent {...props} />;
}
