import { HomePage } from "@/components/shell/HomePage";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("ja");

export default function JaHome() {
  return <HomePage locale="ja" />;
}
