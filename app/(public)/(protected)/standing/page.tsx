import StandingPageContent, { metadata } from "@/components/mpl/StandingPageContent";

export { metadata };

export default function StandingPage(props: { searchParams?: Promise<{ group?: string }> }) {
  return <StandingPageContent {...props} />;
}
