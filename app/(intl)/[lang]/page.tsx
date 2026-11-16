import { notFound } from "next/navigation";
import { HomePage } from "@/components/shell/HomePage";
import { isIntlLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  return isIntlLocale(lang) ? buildMetadata(lang) : {};
}

export default async function IntlHome({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isIntlLocale(lang)) notFound();
  return <HomePage locale={lang} />;
}
