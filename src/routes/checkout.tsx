import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PageHero } from "@/features/catalog/page-hero";
import { useStore } from "@/features/store/store-provider";
import { formatPrice } from "@/lib/catalog/service";

const title = "Checkout — DevAssets";
const description =
  "Complete your DevAssets order: contact details, billing information and license summary before secure payment.";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const countries = [
  "United Kingdom",
  "United States",
  "Germany",
  "France",
  "Netherlands",
  "Spain",
  "Sweden",
  "Australia",
  "Canada",
  "India",
];

const schema = z.object({
  email: z.string().email("We send your license keys and downloads here."),
  fullName: z.string().min(2, "Enter the name for the invoice."),
  company: z.string().optional(),
  vatId: z.string().optional(),
  country: z.string().min(1, "Select a billing country."),
  address: z.string().min(5, "Enter your billing address."),
  city: z.string().min(2, "Enter your city."),
  postcode: z.string().min(3, "Enter a valid postal code."),
  terms: z.boolean().refine((v) => v, "Please accept the license terms to continue."),
});

type FormValues = z.infer<typeof schema>;

function CheckoutPage() {
  const store = useStore();
  const { lines, subtotal, discount, discountCode, total, hydrated } = store;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      fullName: "",
      company: "",
      vatId: "",
      country: "",
      address: "",
      city: "",
      postcode: "",
      terms: false,
    },
    mode: "onBlur",
  });

  const vat = Math.round(total * 0.2);
  const grandTotal = total + vat;

  const onSubmit = async () => {
    // Payment is intentionally not implemented in this phase. When Stripe is
    // wired up, this handler creates a PaymentIntent server-side and confirms it.
    setError(null);
    await new Promise((r) => setTimeout(r, 1200));
    setError(
      "Payment isn't connected yet. This checkout collects and validates order details so the payment step can be added without changing this screen.",
    );
    toast.info("Order details validated", {
      description: "Card payment activates when the payment provider is connected.",
    });
  };

  const submitting = form.formState.isSubmitting;

  if (hydrated && lines.length === 0) {
    return (
      <>
        <PageHero
          crumbs={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]}
          eyebrow="Checkout"
          title="Nothing to check out yet"
        />
        <div className="shell py-16">
          <EmptyState
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Your cart is empty"
            description="Add at least one template and license before continuing to checkout."
            action={
              <Button asChild variant="hero" size="lg">
                <Link to="/templates">Browse templates</Link>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Cart", to: "/cart" }, { label: "Checkout" }]}
        eyebrow="Secure checkout"
        title="Complete your order"
        description="License keys and download links are issued to the email address you enter below."
      />

      <div className="shell grid gap-8 py-12 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:py-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="min-w-0 space-y-6" noValidate>
            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold tracking-tight">
                1. Where should we send your licenses?
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your downloads and license keys are tied to this address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" placeholder="Alex Whitfield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company (optional)</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="organization"
                          placeholder="Northlight Studio"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold tracking-tight">
                2. Billing details
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
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
                  name="vatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT / Tax ID (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="GB123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="street-address"
                          placeholder="24 Bell Yard, Unit 3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input autoComplete="address-level2" placeholder="Manchester" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input autoComplete="postal-code" placeholder="M2 4WU" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-base font-semibold tracking-tight">3. Payment</h2>
              <div className="mt-5 rounded-xl border border-dashed border-border-strong bg-surface/50 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-brand">
                    <CreditCard className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Card payment — coming in the next phase</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Card details will be entered in a hosted payment field, so no card data ever
                      touches DevAssets. This screen already collects everything the payment step
                      needs.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="mt-5">
                    <div className="flex items-start gap-2.5">
                      <FormControl>
                        <Checkbox
                          id="checkout-terms"
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                          className="mt-0.5"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="checkout-terms"
                        className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground"
                      >
                        I accept the license terms for each template in this order and understand
                        digital purchases are refundable for 14 days if the template does not match
                        its description.
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="mt-5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payment not available yet</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

                <Button
                type="submit"
                variant="hero"
                size="xl"
                className="mt-6 w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Validating order…
                  </>
                ) : (
                  <>
                    <Lock /> Continue to payment · {formatPrice(grandTotal)}
                  </>
                )}
              </Button>

              <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                <Link to="/cart">
                  <ArrowLeft /> Back to cart
                </Link>
              </Button>
            </section>
          </form>
        </Form>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
            <h2 className="font-display text-base font-semibold tracking-tight">Order summary</h2>

            <ul className="mt-5 space-y-4">
              {lines.map((line) => (
                <li key={`${line.productId}-${line.license}`} className="flex gap-3">
                  <span className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-border">
                    <ProductScreenshot kind={line.product.preview} tint={line.product.tint} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{line.product.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {line.licenseName} license · {line.quantity}{" "}
                      {line.quantity === 1 ? "seat" : "seats"}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatPrice(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <form
              className="mt-5 flex gap-2 border-t border-border pt-5"
              onSubmit={(e) => {
                e.preventDefault();
                const res = store.applyDiscount(code);
                if (res.ok) {
                  toast.success(res.message);
                  setCode("");
                } else {
                  toast.error(res.message);
                }
              }}
            >
              <label htmlFor="checkout-discount" className="sr-only">
                Discount code
              </label>
              <Input
                id="checkout-discount"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Discount code"
                className="h-9"
              />
              <Button type="submit" variant="subtle" size="sm" className="shrink-0">
                <Tag /> Apply
              </Button>
            </form>

            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount ({discountCode})</dt>
                  <dd className="tabular-nums text-success">−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">VAT (estimated 20%)</dt>
                <dd className="tabular-nums">{formatPrice(vat)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-medium">Total due</dt>
                <dd className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(grandTotal)}
                </dd>
              </div>
            </dl>

            <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden /> 14-day
                refund policy on every template
              </li>
              <li className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden /> Card data handled
                by the payment provider only
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
