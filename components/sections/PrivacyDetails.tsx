import { CookieSettingsButton } from "@/components/islands/CookieSettingsButton";
import { OpenPrivacyFromHash } from "@/components/islands/OpenPrivacyFromHash";

export function PrivacyDetails({ title, paragraphs, settings }: { title: string; paragraphs: string[]; settings: string }) {
  return (
    <details id="privacy" className="max-w-xl text-sm text-white/75">
      <summary className="cursor-pointer font-medium text-white/90">{title}</summary>
      <div className="mt-3 grid gap-3 leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          <CookieSettingsButton label={settings} />
        </p>
      </div>
      <OpenPrivacyFromHash />
    </details>
  );
}
