import type { Metadata } from "next";
import { Prototype } from "@/components/design/Prototype";

export const metadata: Metadata = {
  title: "Design proposal — 鄭宏璋 Luke Cheng",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return <Prototype />;
}
