import { HomePage } from "@/components/shell/HomePage";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("ko");

export default function KoHome() {
  return <HomePage locale="ko" />;
}