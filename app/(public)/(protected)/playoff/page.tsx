import PlayoffPageContent, { metadata } from "@/components/mpl/PlayoffPageContent";

export { metadata };

export default function PlayoffPage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <PlayoffPageContent {...props} />;
}
