import {
  Activity,
  Eye,
  Gauge,
  Receipt,
  ShieldCheck,
  ToggleLeft,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type FeatureGridProps = {
  dict: Dictionary;
};

const ICONS: Record<keyof Dictionary["features"]["items"], LucideIcon> = {
  execution: Gauge,
  risk: ShieldCheck,
  fees: Receipt,
  transparency: Eye,
  realtime: Activity,
  control: ToggleLeft,
};

export function FeatureGrid({ dict }: FeatureGridProps) {
  const items = Object.entries(dict.features.items) as [
    keyof Dictionary["features"]["items"],
    Dictionary["features"]["items"][keyof Dictionary["features"]["items"]],
  ][];

  return (
    <section id="features" className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {dict.features.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-base">
            {dict.features.subtitle}
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(([key, item]) => {
            const Icon = ICONS[key];
            return (
              <Card key={key} className="bg-card/50 border">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
