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

export default async function SignUpPage({
  params,
}: PageProps<"/[lang]/signup">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{dict.auth.signUp.title}</CardTitle>
          <CardDescription>{dict.auth.signUp.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleButton
            lang={lang}
            label={dict.auth.signUp.google}
            errorMessage={dict.auth.errorMessage}
          />
          <p className="text-muted-foreground text-center text-xs leading-relaxed">
            {dict.auth.terms}
          </p>
          <p className="text-muted-foreground text-center text-sm">
            {dict.auth.signUp.haveAccount}{" "}
            <Link
              href={`/${lang}/signin`}
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              {dict.auth.signUp.signInLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
