import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/features/catalog/page-hero";
import { contactTopics } from "@/lib/catalog/content";

const title = "Contact ApnaCodex support";
const description =
  "Ask about licensing, technical setup, invoices or bulk purchases. Pre-sales questions answered within one business day.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email address."),
  topic: z.string().min(1, "Choose a topic so we route your message correctly."),
  subject: z.string().min(4, "A short subject helps us respond faster."),
  message: z.string().min(20, "Please give us at least a couple of sentences of detail."),
});

type FormValues = z.infer<typeof schema>;

const expectations = [
  { Icon: Clock, label: "Pre-sales questions", value: "Within 1 business day" },
  { Icon: MessageSquare, label: "Technical support", value: "Within 2 business days" },
  { Icon: Mail, label: "Invoices & billing", value: "Within 1 business day" },
];

function ContactPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", topic: "", subject: "", message: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    // Front-end only for this phase: the message endpoint arrives with the API.
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Message ready to send", {
      description: `Thanks ${values.name.split(" ")[0]} — message delivery goes live with the support API. Nothing was sent yet.`,
    });
    form.reset();
  };

  const submitting = form.formState.isSubmitting;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
        eyebrow="Support"
        title="Talk to the people who build the templates"
        description="No ticket queue theatre — messages go to the team that wrote the code. Tell us what you're building and we'll tell you honestly whether a template fits."
      />

      <div className="shell grid gap-10 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:py-16">
        <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alex Whitfield" autoComplete="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="alex@studio.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is this about?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contactTopics.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Agency license for three client sites" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        placeholder="Tell us what you're building, which template you're looking at, and any deadline we should know about."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include the template name if your question is about a specific listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-5">
                <Button type="submit" variant="hero" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send /> Send message
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Message delivery activates with the support API in the next phase.
                </p>
              </div>
            </form>
          </Form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">Response times</h2>
            <ul className="mt-4 space-y-4">
              {expectations.map(({ Icon, label, value }) => (
                <li key={label} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-brand">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Before you write in
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Most pre-sales answers are already on the licensing page — including client work, team
              seats and upgrade rules. Every template also has a full public demo, so you can check
              the flows yourself first.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-6">
            <p className="eyebrow">Support hours</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Monday to Friday, 09:00–18:00 CET. Messages sent at the weekend are answered on the
              next working day.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
