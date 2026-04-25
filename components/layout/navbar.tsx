import Link from "next/link";
import type { User } from "@supabase/supabase-js";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface NavbarProps {
  lang: Locale;
  dict: Dictionary;
  user: User | null;
}

export function Navbar({ lang, dict, user }: NavbarProps) {
  const navLinks = [
    { href: `/${lang}#features`, label: dict.nav.features },
    { href: `/${lang}#reliability`, label: dict.nav.reliability },
    { href: `/${lang}/chart`, label: dict.nav.chart },
    { href: `/${lang}#pricing`, label: dict.nav.pricing },
  ] as const;

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href={`/${lang}`}
            className="flex items-center gap-2 font-semibold"
          >
            <Icon name="line-chart" className="text-primary h-5 w-5" />
            <span className="text-base tracking-tight">Outbound</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <LocaleSwitcher current={lang} label={dict.common.language} />
          <ThemeToggle label={dict.common.theme} />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={dict.nav.openMenu}
              >
                <Icon name="menu" className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Outbound</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/${lang}/signin`}>{dict.nav.signIn}</Link>
                    </Button>
                    <Button asChild>
                      <Link href={`/${lang}/signup`}>{dict.nav.signUp}</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {user ? (
            <UserMenu
              user={user}
              lang={lang}
              signOutLabel={dict.auth.signOut}
            />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/${lang}/signin`}>{dict.nav.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/${lang}/signup`}>{dict.nav.signUp}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
