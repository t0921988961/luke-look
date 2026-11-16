"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { getEmailAddress, getMailtoHref } from "@/lib/contact";
import { ArrowUpRight, CheckIcon, CopyIcon, MailIcon } from "@/components/ui/Icons";

type Labels = {
  reveal: string;
  hide: string;
  copy: string;
  copied: string;
  send: string;
  noscript: string;
};

const REGION_ID = "email-reveal";

export function EmailReveal({ labels }: { labels: Labels }) {
  const [address, setAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyButton = useRef<HTMLButtonElement>(null);
  const addressText = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const focusCopy = useRef(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (address && focusCopy.current) {
      focusCopy.current = false;
      copyButton.current?.focus();
    }
  }, [address]);

  const toggle = () => {
    if (address) {
      setAddress(null);
      setCopied(false);
      return;
    }
    focusCopy.current = true;
    track("reveal_email", { location: "contact" });
    setAddress(getEmailAddress());
  };

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      track("copy_email", { location: "contact" });
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      const node = addressText.current;
      const selection = window.getSelection();
      if (node && selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={address !== null}
        aria-controls={REGION_ID}
        onClick={toggle}
        className="inline-flex h-12 w-fit items-center gap-2 rounded-full border border-white/30 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white"
      >
        <MailIcon className="text-[17px] text-sky" />
        {address ? labels.hide : labels.reveal}
      </button>
      <noscript>
        <p className="text-sm text-white/75">{labels.noscript}</p>
      </noscript>
      <div id={REGION_ID} aria-live="polite">
        {address && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <span
              ref={addressText}
              className="min-w-0 text-[clamp(1.15rem,3vw,2.25rem)] font-bold tracking-tight break-all"
            >
              {address}
            </span>
            <div className="flex flex-wrap gap-3">
              <button
                ref={copyButton}
                type="button"
                onClick={copy}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white/85 transition-colors hover:border-white hover:text-white"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? labels.copied : labels.copy}
              </button>
              <a
                href={getMailtoHref()}
                data-track="contact_click"
                data-param-method="email"
                data-param-location="contact"
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/25 px-4 text-sm text-white/85 transition-colors hover:border-white hover:text-white"
              >
                {labels.send}
                <ArrowUpRight className="text-sky transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
