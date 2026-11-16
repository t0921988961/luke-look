import "../../globals.css";
import tcBold from "../../../assets/fonts/NotoSansTC-700.woff2";
import { RootShell } from "@/components/shell/RootShell";
import { latinClassName } from "@/lib/fonts/latin";

export { viewport } from "@/lib/metadata";

export default function EnRootLayout({ children }: LayoutProps<"/en">) {
  return (
    <RootShell locale="en" className={latinClassName} preload={[tcBold]}>
      {children}
    </RootShell>
  );
}
