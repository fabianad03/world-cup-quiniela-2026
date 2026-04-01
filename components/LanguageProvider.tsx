"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Language, TranslationSchema, translations } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: TranslationSchema;
  mounted: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  async function saveLanguagePreference(lang: Language) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        preferred_language: lang,
      });
    } else {
      localStorage.setItem("language", lang);
    }
  }

  async function setLanguage(lang: Language) {
    setLanguageState(lang);
    await saveLanguagePreference(lang);
  }

  useEffect(() => {
    async function loadLanguage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("id", user.id)
          .maybeSingle();

        if (
          profile?.preferred_language === "en" ||
          profile?.preferred_language === "es"
        ) {
          setLanguageState(profile.preferred_language);
        } else {
          setLanguageState("en");

          await supabase.from("profiles").upsert({
            id: user.id,
            preferred_language: "en",
          });
        }
      } else {
        const savedLanguage = localStorage.getItem("language") as Language | null;

        if (savedLanguage === "en" || savedLanguage === "es") {
          setLanguageState(savedLanguage);
        }
      }

      setMounted(true);
    }

    loadLanguage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("preferred_language")
          .eq("id", session.user.id)
          .maybeSingle();

        if (
          profile?.preferred_language === "en" ||
          profile?.preferred_language === "es"
        ) {
          setLanguageState(profile.preferred_language);
        } else {
          setLanguageState("en");

          await supabase.from("profiles").upsert({
            id: session.user.id,
            preferred_language: "en",
          });
        }
      } else {
        const savedLanguage = localStorage.getItem("language") as Language | null;

        if (savedLanguage === "en" || savedLanguage === "es") {
          setLanguageState(savedLanguage);
        } else {
          setLanguageState("en");
        }
      }

      setMounted(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
      mounted,
    }),
    [language, mounted]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}