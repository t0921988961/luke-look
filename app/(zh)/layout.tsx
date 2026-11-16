import "../globals.css";
import { RootShell } from "@/components/shell/RootShell";

export { viewport } from "@/lib/metadata";

export default function ZhRootLayout({ children }: LayoutProps<"/">) {
  return <RootShell locale="zh-TW">{children}</RootShell>;
}
