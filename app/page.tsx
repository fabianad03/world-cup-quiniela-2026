import { supabase } from "@/lib/supabase";
import HomePageClient from "@/components/HomePageClient";

export default async function Home() {
  const { data: matches } = await supabase.from("matches").select("*");

  return <HomePageClient matches={matches || []} />;
}