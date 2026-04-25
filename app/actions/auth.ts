"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

export async function signOut(lang: Locale = DEFAULT_LOCALE): Promise<never> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}
