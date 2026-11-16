import "../globals.css";
import tcBold from "../../assets/fonts/NotoSansTC-700.woff2";
import { RootShell } from "@/components/shell/RootShell";
import { latinClassName } from "@/lib/fonts/latin";

export { viewport } from "@/lib/metadata";

export default function ZhRootLayout({ children }: LayoutProps<"/">) {
  return (
    <RootShell locale="zh-TW" className={latinClassName} preload={[tcBold]}>
      {children}
    </RootShell>
  );
}
