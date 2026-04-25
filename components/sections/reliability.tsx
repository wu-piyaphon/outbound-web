import { Check, CircleDollarSign, Database, ServerCog } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface ReliabilityProps {
  dict: Dictionary;
}

const METRICS = [
  { key: "targetReturn", value: "2–3%" },
  { key: "maxDrawdown", value: "5%" },
  { key: "uptime", value: "99.9%" },
  { key: "feesTracked", value: "3" },
] as const;

const STACK_ICONS = {
  alpaca: CircleDollarSign,
  supabase: Database,
  go: ServerCog,
} as const;

export function Reliability({ dict }: ReliabilityProps) {
  return (
    <section id="reliability" className="bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {dict.reliability.title}
          </h2>
          <p className="text-muted-foreground mt-4 text-base">
            {dict.reliability.subtitle}
          </p>
        </div>

        {/* Metrics strip */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {METRICS.map(({ key, value }) => (
            <Card key={key} className="text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  {value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs tracking-wide uppercase">
                  {dict.reliability.metrics[key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-semibold tracking-tight">
            {dict.reliability.howItWorks.title}
          </h3>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(["signal", "risk", "execute"] as const).map((step) => (
              <Card key={step}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {dict.reliability.howItWorks.steps[step].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {dict.reliability.howItWorks.steps[step].description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Transparency / fees */}
        <div className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {dict.reliability.transparency.title}
            </h3>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              {dict.reliability.transparency.description}
            </p>
          </div>
          <ul className="space-y-3">
            {(["wise", "regulatory", "wire"] as const).map((item) => (
              <li
                key={item}
                className="bg-background flex items-start gap-3 rounded-lg border p-4"
              >
                <Check className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <span className="text-sm">
                  {dict.reliability.transparency.items[item]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tech stack */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-semibold tracking-tight">
            {dict.reliability.stack.title}
          </h3>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {(["alpaca", "supabase", "go"] as const).map((tech) => {
              const Icon = STACK_ICONS[tech];
              return (
                <div
                  key={tech}
                  className="bg-background flex items-center gap-3 rounded-lg border p-4"
                >
                  <Icon className="text-primary h-6 w-6" />
                  <span className="text-sm font-medium">
                    {dict.reliability.stack[tech]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-3xl">
          <h3 className="text-center text-2xl font-semibold tracking-tight">
            {dict.reliability.faq.title}
          </h3>
          <Accordion type="single" collapsible className="mt-8 w-full">
            {(["q1", "q2", "q3", "q4"] as const).map((q) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-left">
                  {dict.reliability.faq.items[q].question}
                </AccordionTrigger>
                <AccordionContent>
                  {dict.reliability.faq.items[q].answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
