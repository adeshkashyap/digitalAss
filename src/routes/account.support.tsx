import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  CreditCard,
  Download,
  FileQuestion,
  LifeBuoy,
  Loader2,
  Paperclip,
  ScrollText,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { FAQAccordion } from "@/components/marketplace/faq-accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AccountPageHeader,
  DemoNote,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/features/account/account-ui";
import { accountKeys, ordersQuery, purchasesQuery, ticketsQuery } from "@/lib/account/queries";
import { createSupportTicket, formatDateTime } from "@/lib/account/service";
import type { TicketCategory } from "@/lib/account/types";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/account/support")({
  head: () => ({
    meta: [
      { title: "Help & support — ApnaCodex account" },
      {
        name: "description",
        content: "Get help with orders, downloads, licenses and billing questions.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SupportPage,
});

const categoryOptions: { value: TicketCategory; label: string; icon: typeof LifeBuoy }[] = [
  { value: "order", label: "Order question", icon: CreditCard },
  { value: "download", label: "Download issue", icon: Download },
  { value: "license", label: "License question", icon: ScrollText },
  { value: "billing", label: "Refund or billing", icon: CreditCard },
  { value: "technical", label: "Technical help", icon: FileQuestion },
  { value: "other", label: "Something else", icon: LifeBuoy },
];

const helpArticles = [
  { title: "Where do I find my download files?", category: "Downloads" },
  { title: "Which license do I need for client work?", category: "Licenses" },
  { title: "How do template updates reach me?", category: "Updates" },
  { title: "Can I upgrade a personal license later?", category: "Licenses" },
  { title: "What is included in a template purchase?", category: "Purchases" },
  { title: "How do refunds work for source code?", category: "Billing" },
];

const faqs = [
  {
    q: "How long do I keep access to my downloads?",
    a: "Your purchase never expires. The update window depends on your license tier, but the build you own stays available in Downloads.",
  },
  {
    q: "Can I use one template for several client projects?",
    a: "Personal and commercial licenses cover a single end product. The agency license covers unlimited client projects with up to ten developer seats.",
  },
  {
    q: "Do you support upgrades between license tiers?",
    a: "Upgrades will be handled from the Licenses page once billing is connected. Until then, contact support and we will note the request.",
  },
  {
    q: "Why does my download not produce a file yet?",
    a: "This phase is frontend-only: download actions are recorded and confirmed, but artifact storage and secure links arrive with the backend.",
  },
];

const ticketSchema = z.object({
  category: z.enum(["order", "download", "license", "billing", "technical", "other"]),
  reference: z.string().optional(),
  subject: z.string().min(6, "Give your request a short subject (at least 6 characters)."),
  message: z.string().min(24, "Please describe the issue in at least 24 characters."),
});

type TicketValues = z.infer<typeof ticketSchema>;

function SupportPage() {
  const queryClient = useQueryClient();
  const ticketsQ = useQuery(ticketsQuery());
  const purchasesQ = useQuery(purchasesQuery());
  const ordersQ = useQuery(ordersQuery());
  const purchaseProductIds = useMemo(
    () => (purchasesQ.data ?? []).map((p) => p.productId),
    [purchasesQ.data],
  );
  const { productsById } = useProductsByIds(purchaseProductIds);
  const [articleSearch, setArticleSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { category: "order", subject: "", message: "", reference: "none" },
  });

  const category = watch("category");
  const reference = watch("reference");

  const submit = useMutation({
    mutationFn: (values: TicketValues) => {
      const productIds = new Set((purchasesQ.data ?? []).map((p) => p.productId));
      const payload: Parameters<typeof createSupportTicket>[0] = {
        category: values.category,
        subject: values.subject,
        message: values.message,
      };
      if (values.reference && values.reference !== "none") {
        if (productIds.has(values.reference)) payload.productId = values.reference;
        else payload.orderId = values.reference;
      }
      return createSupportTicket(payload);
    },
    onSuccess: (ticket) => {
      void queryClient.invalidateQueries({ queryKey: accountKeys.tickets });
      reset({ category: "order", subject: "", message: "", reference: "none" });
      toast.success(`Request ${ticket.reference} saved locally`, {
        description: "Demo mode: nothing was emailed. A real ticket queue arrives next phase.",
      });
    },
    onError: () => toast.error("Couldn't save your request"),
  });

  const articles = helpArticles.filter((a) =>
    `${a.title} ${a.category}`.toLowerCase().includes(articleSearch.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Support"
        title="Help & support"
        description="Search help topics, review your requests, or send us the details of what you're stuck on."
      />

      {/* Search + quick routes */}
      <Panel className="overflow-hidden">
        <div className="border-b border-border p-5">
          <div className="relative max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Search help articles"
              aria-label="Search help articles"
              className="pl-9"
            />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {articles.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No article matches “{articleSearch}”. Send a request below and we'll answer
                directly.
              </li>
            ) : (
              articles.map((a) => (
                <li key={a.title}>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Help centre articles are coming with the docs site", {
                        description: a.title,
                      })
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-2/40 px-3 py-2.5 text-left text-sm transition-colors hover:border-border-strong"
                  >
                    <span className="min-w-0 truncate">{a.title}</span>
                    <span className="eyebrow shrink-0 text-[0.625rem]">{a.category}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Order help",
              hint: "Payment status, invoices",
              to: "/account/orders" as const,
              icon: CreditCard,
            },
            {
              label: "Download issue",
              hint: "Files and versions",
              to: "/account/downloads" as const,
              icon: Download,
            },
            {
              label: "License question",
              hint: "Seats and usage",
              to: "/account/licenses" as const,
              icon: ScrollText,
            },
            {
              label: "Licensing guide",
              hint: "Compare tiers",
              to: "/pricing" as const,
              icon: BookOpen,
            },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-md border border-border bg-surface-2/40 p-4 transition-colors hover:border-border-strong"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Ticket form */}
        <Panel className="overflow-hidden">
          <PanelHeader
            title="Contact support"
            description="Include the order or template so we can find your license quickly."
            icon={LifeBuoy}
          />
          <form
            onSubmit={handleSubmit((values) => submit.mutate(values))}
            className="space-y-5 p-5"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ticket-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setValue("category", v as TicketCategory)}
                >
                  <SelectTrigger id="ticket-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ticket-reference">Related order or template</Label>
                <Select value={reference ?? "none"} onValueChange={(v) => setValue("reference", v)}>
                  <SelectTrigger id="ticket-reference">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specific</SelectItem>
                    {(ordersQ.data ?? []).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        Order {o.reference}
                      </SelectItem>
                    ))}
                    {(purchasesQ.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.productId}>
                        {productsById.get(p.productId)?.name ?? "Template"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input id="ticket-subject" {...register("subject")} aria-invalid={!!errors.subject} />
              {errors.subject && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ticket-message">How can we help?</Label>
              <Textarea
                id="ticket-message"
                rows={6}
                {...register("message")}
                aria-invalid={!!errors.message}
                placeholder="Tell us what you expected, what happened, and any error text you saw."
              />
              {errors.message && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  toast.info("Attachments arrive with the support backend", {
                    description: "For now, paste error text directly into the message.",
                  })
                }
              >
                <Paperclip /> Add attachment
              </Button>
              <Button type="submit" variant="brand" disabled={submit.isPending} className="ml-auto">
                {submit.isPending && <Loader2 className="animate-spin" />} Send request
              </Button>
            </div>

            <DemoNote>
              Requests are stored in this browser only. Email delivery and a real ticket queue are
              part of the backend phase.
            </DemoNote>
          </form>
        </Panel>

        <div className="space-y-6">
          {/* Existing tickets */}
          <Panel className="overflow-hidden">
            <PanelHeader
              title="Your requests"
              description="Recent support conversations."
              icon={FileQuestion}
            />
            {ticketsQ.isPending ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">Loading requests…</p>
            ) : (ticketsQ.data ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                You have no support requests yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {(ticketsQ.data ?? []).map((ticket) => (
                  <li key={ticket.id} className="space-y-2 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {ticket.reference}
                      </span>
                      <StatusBadge
                        tone={
                          ticket.status === "resolved"
                            ? "success"
                            : ticket.status === "awaiting-reply"
                              ? "warning"
                              : "brand"
                        }
                      >
                        {ticket.status === "awaiting-reply"
                          ? "Awaiting reply"
                          : ticket.status === "resolved"
                            ? "Resolved"
                            : "Open"}
                      </StatusBadge>
                    </div>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {ticket.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(ticket.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader title="Common questions" icon={BookOpen} />
            <div className="p-5">
              <FAQAccordion items={faqs} idPrefix="support-faq" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
