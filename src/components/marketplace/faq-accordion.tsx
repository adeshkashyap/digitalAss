import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/lib/catalog/content";
import { cn } from "@/lib/utils";

export function FAQAccordion({
  items,
  className,
  idPrefix = "faq",
}: {
  items: Faq[];
  className?: string;
  idPrefix?: string;
}) {
  return (
    <Accordion type="single" collapsible className={cn("w-full", className)}>
      {items.map((item, i) => (
        <AccordionItem
          key={`${idPrefix}-${i}`}
          value={`${idPrefix}-${i}`}
          className="border-b border-border"
        >
          <AccordionTrigger className="py-5 text-left text-[0.9375rem] font-medium hover:no-underline">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-6 text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
