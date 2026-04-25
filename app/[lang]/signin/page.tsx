import Link from "next/link";
import { notFound } from "next/navigation";

import { GoogleButton } from "@/components/auth/google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/app/[lang]/dictionaries";
import { isLocale } from "@/lib/i18n/config";

export default async function SignInPage({
  params,
}: PageProps<"/[lang]/signin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{dict.auth.signIn.title}</CardTitle>
          <CardDescription>{dict.auth.signIn.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleButton
            lang={lang}
            label={dict.auth.signIn.google}
            errorMessage={dict.auth.errorMessage}
          />
          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            {dict.auth.terms}
          </p>
          <p className="text-muted-foreground text-center text-sm">
            {dict.auth.signIn.noAccount}{" "}
            <Link
              href={`/${lang}/signup`}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {dict.auth.signIn.signUpLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
