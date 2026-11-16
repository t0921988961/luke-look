import "../../globals.css";
import krBold from "../../../assets/fonts/NotoSansKR-700.woff2";
import { RootShell } from "@/components/shell/RootShell";
import { latinClassName } from "@/lib/fonts/latin";

export { viewport } from "@/lib/metadata";

export default function KoRootLayout({ children }: LayoutProps<"/ko">) {
  return (
    <RootShell locale="ko" className={latinClassName} preload={[krBold]}>
      {children}
    </RootShell>
  );
}