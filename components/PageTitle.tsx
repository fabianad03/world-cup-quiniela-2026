"use client";

import { useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function PageTitle({
  en,
  es,
}: {
  en: string;
  es: string;
}) {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === "es" ? es : en;
  }, [language, en, es]);

  return null;
}