import "../../globals.css";
import jpBold from "../../../assets/fonts/NotoSansJP-700.woff2";
import { RootShell } from "@/components/shell/RootShell";
import { latinClassName } from "@/lib/fonts/latin";

export { viewport } from "@/lib/metadata";

export default function JaRootLayout({ children }: LayoutProps<"/ja">) {
  return (
    <RootShell locale="ja" className={latinClassName} preload={[jpBold]}>
      {children}
    </RootShell>
  );
}
