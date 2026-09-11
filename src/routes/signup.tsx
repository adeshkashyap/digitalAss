import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLayout, SocialButtons } from "@/features/auth/auth-layout";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const title = "Create your DevAssets account";
const description =
  "Create a free DevAssets account to keep your purchases, license keys and template downloads together.";

export const Route = createFileRoute("/signup")({
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
  component: SignupPage,
});

const schema = z
  .object({
    name: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .regex(/[0-9]/, "Include at least one number.")
      .regex(/[A-Z]/, "Include at least one capital letter."),
    terms: z.boolean().refine((v) => v, "Please accept the license agreement to continue."),
  })
  .strict();

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One capital letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
];

function SignupPage() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", terms: false },
    mode: "onBlur",
  });

  const password = form.watch("password");

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await register(values.name, values.email, values.password);
      toast.success("Account created");
      navigate({ to: "/account" });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not create account");
    }
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Free to create. You only pay when you buy a template."
      points={[
        "Keep every purchase, license and invoice together",
        "Get notified when a template you own is updated",
        "Wishlist templates and pick up where you left off",
      ]}
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={visible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setVisible((v) => !v)}
                      aria-label={visible ? "Hide password" : "Show password"}
                      aria-pressed={visible}
                      className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                  {rules.map((r) => {
                    const ok = r.test(password ?? "");
                    return (
                      <li
                        key={r.label}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px]",
                          ok ? "text-success" : "text-muted-foreground",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2.5">
                  <FormControl>
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="terms"
                    className="cursor-pointer text-xs font-normal leading-relaxed text-muted-foreground"
                  >
                    I agree to the DevAssets license agreement and terms of service, and understand
                    template source may not be redistributed.
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <div className="relative py-2 text-center">
            <span className="relative z-10 bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
          </div>

          <SocialButtons action="Sign up" />
        </form>
      </Form>
    </AuthLayout>
  );
}
