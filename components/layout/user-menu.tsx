import Link from "next/link";
import { LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Locale } from "@/lib/i18n/config";

type UserMenuProps = {
  user: User;
  lang: Locale;
  signOutLabel: string;
  dashboardLabel: string;
};

export function UserMenu({
  user,
  lang,
  signOutLabel,
  dashboardLabel,
}: UserMenuProps) {
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email ??
    "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={displayName}
        >
          <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {initial}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <span className="truncate">{displayName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/dashboard`} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {dashboardLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut.bind(null, lang)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {signOutLabel}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
