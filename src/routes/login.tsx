import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

const title = "Sign in — DevAssets";
const description =
  "Sign in to your DevAssets account to reach your purchases, license keys and template downloads.";

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter the email address you purchased with."),
  password: z.string().min(8, "Passwords are at least 8 characters."),
  remember: z.boolean(),
});

function LoginPage() {
  const [visible, setVisible] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
    mode: "onBlur",
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 900));
    toast.info("Accounts arrive in the next phase", {
      description: "Your details validated correctly — sign-in activates with the accounts API.",
    });
  };

  const submitting = form.formState.isSubmitting;

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Reach your purchases, license keys and versioned downloads."
      points={[
        "Every purchase, license and invoice in one place",
        "Download the latest version of any template you own",
        "Upgrade a license by paying only the difference",
      ]}
      footer={
        <>
          New to DevAssets?{" "}
          <Link to="/signup" className="font-medium text-brand underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset activates with the accounts API")}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={visible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5">
                <FormControl>
                  <Checkbox
                    id="remember"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                </FormControl>
                <FormLabel
                  htmlFor="remember"
                  className="cursor-pointer font-normal text-muted-foreground"
                >
                  Keep me signed in on this device
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Checking…
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="relative py-2 text-center">
            <span className="relative z-10 bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
          </div>

          <SocialButtons action="Continue" />
        </form>
      </Form>
    </AuthLayout>
  );
}
