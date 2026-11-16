import "../../globals.css";
import { notFound } from "next/navigation";
import { RootShell } from "@/components/shell/RootShell";
import { INTL_LOCALES, isIntlLocale } from "@/lib/i18n/config";

export { viewport } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return INTL_LOCALES.map((lang) => ({ lang }));
}

export default async function IntlRootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isIntlLocale(lang)) notFound();
  return <RootShell locale={lang}>{children}</RootShell>;
}
