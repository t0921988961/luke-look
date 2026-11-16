import { HomePage } from "@/components/shell/HomePage";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("zh-TW");

export default function ZhHome() {
  return <HomePage locale="zh-TW" />;
}
