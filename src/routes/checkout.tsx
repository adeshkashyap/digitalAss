import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/features/catalog/page-hero";
import { type CartLine, useStore } from "@/features/store/store-provider";
import { api, ApiError } from "@/lib/api/client";
import { getAuthToken } from "@/lib/api/auth-storage";
import { formatPrice } from "@/lib/catalog/service";
import { cn } from "@/lib/utils";

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

function CheckoutProgress({ step }: { step: "cart" | "details" | "payment" }) {
  const items = [
    { id: "cart", label: "Cart", to: "/cart" as const },
    { id: "details", label: "Details" },
    { id: "payment", label: "Payment" },
  ];
  const currentIndex = items.findIndex((i) => i.id === step);

  return (
    <nav aria-label="Checkout progress" className="shell border-b border-border py-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={item.id} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground" aria-hidden>
                  /
                </span>
              )}
              {item.to ? (
                <Link
                  to={item.to}
                  className={cn(
                    done && "text-muted-foreground hover:text-foreground",
                    active && "font-medium text-foreground",
                    !done && !active && "text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(active ? "font-medium text-foreground" : "text-muted-foreground")}
                  aria-current={active ? "step" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const store = useStore();
  const { lines, subtotal, discount, discountCode, total, hydrated } = store;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

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
    setError(null);
    if (!getAuthToken()) {
      toast.error("Sign in to complete checkout");
      navigate({ to: "/login" });
      return;
    }
    try {
      const session = await api.post<{ url: string | null }>("/api/checkout/session", {
        lines: lines.map((line) => ({
          productId: line.productId,
          license: line.license,
          quantity: line.quantity,
        })),
        discountCode: discountCode ?? undefined,
      });
      if (session.url) {
        window.location.href = session.url;
        return;
      }
      setError("Stripe checkout could not be started. Check API keys in backend .env.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Checkout failed";
      setError(message);
      toast.error(message);
    }
  };

  const submitting = form.formState.isSubmitting;

  if (hydrated && lines.length === 0) {
    return (
      <>
        <PageHero
          crumbs={[
            { label: "Home", to: "/" },
            { label: "Cart", to: "/cart" },
            { label: "Checkout" },
          ]}
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
      <CheckoutProgress step="details" />

      <div className="shell grid gap-8 py-12 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:py-16">
        <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen} className="lg:hidden">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              Order summary · {formatPrice(grandTotal)}
              <ChevronDown
                className={cn("transition-transform", summaryOpen && "rotate-180")}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 rounded-lg border border-border bg-card p-4">
            <CheckoutSummary
              lines={lines}
              subtotal={subtotal}
              discount={discount}
              discountCode={discountCode}
              vat={vat}
              grandTotal={grandTotal}
              compact
            />
          </CollapsibleContent>
        </Collapsible>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, () => {
              setValidationError("Fix the highlighted fields to continue.");
            })}
            className="min-w-0 space-y-6"
            noValidate
          >
            {validationError && Object.keys(form.formState.errors).length > 0 && (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Check your details</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <fieldset className="rounded-lg border border-border bg-card p-6">
              <legend className="font-display text-base font-semibold tracking-tight">
                1. Where should we send your licenses?
              </legend>
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
            </fieldset>

            <fieldset className="rounded-lg border border-border bg-card p-6">
              <legend className="font-display text-base font-semibold tracking-tight">
                2. Billing details
              </legend>
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
            </fieldset>

            <fieldset className="rounded-lg border border-border bg-card p-6">
              <legend className="font-display text-base font-semibold tracking-tight">
                3. Payment
              </legend>
              <div className="mt-5 rounded-xl border border-dashed border-border-strong bg-surface/50 p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-brand">
                    <CreditCard className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Secure payment via Stripe Checkout</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      You will be redirected to Stripe to enter card details. No card data is stored
                      on DevAssets servers.
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
                  <AlertTitle>Checkout could not continue</AlertTitle>
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
            </fieldset>
          </form>
        </Form>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <CheckoutSummary
            lines={lines}
            subtotal={subtotal}
            discount={discount}
            discountCode={discountCode}
            vat={vat}
            grandTotal={grandTotal}
            code={code}
            setCode={setCode}
            onApplyCode={async (value) => {
              const res = await store.applyDiscount(value);
              if (res.ok) {
                toast.success(res.message);
                setCode("");
              } else {
                toast.error(res.message);
              }
            }}
          />
        </aside>
      </div>
    </>
  );
}

function CheckoutSummary({
  lines,
  subtotal,
  discount,
  discountCode,
  vat,
  grandTotal,
  code,
  setCode,
  onApplyCode,
  compact = false,
}: {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  vat: number;
  grandTotal: number;
  code?: string;
  setCode?: (v: string) => void;
  onApplyCode?: (code: string) => void | Promise<void>;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-[var(--shadow-elevated)]",
        compact ? "p-4" : "p-6",
      )}
    >
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

      {!compact && onApplyCode && setCode && code !== undefined && (
        <form
          className="mt-5 flex gap-2 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onApplyCode(code);
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
            className="h-11"
          />
          <Button type="submit" variant="subtle" className="h-11 shrink-0 touch-target">
            <Tag /> Apply
          </Button>
        </form>
      )}

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

      {!compact && (
        <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
            14-day refund policy on every template
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
            Card data handled by the payment provider only
          </li>
        </ul>
      )}
    </div>
  );
}
