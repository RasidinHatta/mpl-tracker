import PredictionPageContent, { metadata } from "@/components/mpl/PredictionPageContent";

export { metadata };

export default function PredictionPage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <PredictionPageContent {...props} />;
}
