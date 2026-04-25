"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META"] as const;

interface SymbolPickerProps {
  current: string;
  label: string;
}

export function SymbolPicker({ current, label }: SymbolPickerProps) {
  const router = useRouter();
  const params = useSearchParams();

  function pick(symbol: string) {
    const next = new URLSearchParams(params);
    next.set("symbol", symbol);
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {current}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SYMBOLS.map((s) => (
            <DropdownMenuItem
              key={s}
              onSelect={() => pick(s)}
              className={s === current ? "font-semibold" : undefined}
            >
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
