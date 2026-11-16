import { HomePage } from "@/components/shell/HomePage";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("en");

export default function EnHome() {
  return <HomePage locale="en" />;
}
