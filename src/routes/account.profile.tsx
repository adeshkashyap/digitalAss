import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Laptop, Loader2, Palette, ShieldCheck, Upload, UserCog } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccountPageHeader,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
} from "@/features/account/account-ui";
import { useTheme } from "@/features/theme/theme-provider";
import { accountKeys, userQuery } from "@/lib/account/queries";
import { updatePreferences, updateProfile } from "@/lib/account/service";
import type { CustomerUser } from "@/lib/account/types";

export const Route = createFileRoute("/account/profile")({
  head: () => ({
    meta: [
      { title: "Profile & settings — DevAssets account" },
      { name: "description", content: "Manage your profile, notification preferences and theme." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  company: z.string().max(80, "Keep this under 80 characters.").optional(),
  location: z.string().max(80, "Keep this under 80 characters.").optional(),
  timezone: z.string().min(1, "Select a timezone."),
  language: z.string().min(1, "Select a language."),
});

type ProfileValues = z.infer<typeof profileSchema>;

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ProfileForm({ user }: { user: CustomerUser }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      company: user.company ?? "",
      location: user.location ?? "",
      timezone: user.timezone,
      language: user.language,
    },
  });

  const save = useMutation({
    mutationFn: (values: ProfileValues) => updateProfile(values),
    onSuccess: (updated) => {
      queryClient.setQueryData(accountKeys.me, updated);
      reset({
        name: updated.name,
        email: updated.email,
        company: updated.company ?? "",
        location: updated.location ?? "",
        timezone: updated.timezone,
        language: updated.language,
      });
      toast.success("Profile saved", {
        description: "Stored locally for now — it will sync to your account with the backend.",
      });
    },
    onError: () => toast.error("Couldn't save your profile"),
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => save.mutate(values))}
      className="space-y-5 p-5"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-gradient font-display text-lg font-semibold text-brand-foreground">
          {user.name
            .split(" ")
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
        <div>
          <Button
            type="button"
            size="sm"
            variant="subtle"
            onClick={() =>
              toast.info("Avatar upload is a demo control", {
                description: "Image storage is connected in a later phase.",
              })
            }
          >
            <Upload /> Upload photo
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            PNG or JPG, square, at least 256×256.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Full name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...register("name")} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field
          id="company"
          label="Company / organization"
          hint="Optional"
          error={errors.company?.message}
        >
          <Input id="company" autoComplete="organization" {...register("company")} />
        </Field>
        <Field id="location" label="Location" hint="Optional" error={errors.location?.message}>
          <Input id="location" {...register("location")} />
        </Field>
        <Field id="timezone" label="Timezone" error={errors.timezone?.message}>
          <Input id="timezone" {...register("timezone")} />
        </Field>
        <Field id="language" label="Language" error={errors.language?.message}>
          <Input id="language" {...register("language")} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <Button type="submit" variant="brand" disabled={!isDirty || save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" />} Save changes
        </Button>
        <Button type="button" variant="ghost" disabled={!isDirty} onClick={() => reset()}>
          Discard
        </Button>
        <p className="text-xs text-muted-foreground">
          Member since {new Date(user.memberSince).getFullYear()}
        </p>
      </div>
    </form>
  );
}

function PreferenceRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {title}
        </Label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ProfilePage() {
  const userQ = useQuery(userQuery());
  const queryClient = useQueryClient();
  const { theme, toggle } = useTheme();
  const [prefs, setPrefs] = useState<CustomerUser["preferences"] | null>(null);

  useEffect(() => {
    if (userQ.data) setPrefs(userQ.data.preferences);
  }, [userQ.data]);

  const savePrefs = useMutation({
    mutationFn: (next: Partial<CustomerUser["preferences"]>) => updatePreferences(next),
    onSuccess: (updated) => {
      queryClient.setQueryData(accountKeys.me, updated);
      setPrefs(updated.preferences);
      toast.success("Preference updated");
    },
  });

  const setPref = (key: keyof CustomerUser["preferences"], value: boolean) => {
    setPrefs((p) => (p ? { ...p, [key]: value } : p));
    savePrefs.mutate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Profile"
        title="Profile & settings"
        description="Your details, email preferences, security placeholders and appearance."
      />

      {userQ.isPending ? (
        <Panel className="space-y-4 p-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Panel>
      ) : userQ.isError || !userQ.data ? (
        <ErrorState onRetry={() => void userQ.refetch()} />
      ) : (
        <Tabs defaultValue="profile" className="space-y-5">
          <TabsList className="flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Panel className="overflow-hidden">
              <PanelHeader
                title="Your profile"
                description="Shown on invoices and support requests."
                icon={UserCog}
              />
              <ProfileForm user={userQ.data} />
            </Panel>
          </TabsContent>

          <TabsContent value="account" className="space-y-5">
            <Panel className="overflow-hidden">
              <PanelHeader
                title="Email preferences"
                description="Choose what DevAssets sends you."
                icon={ShieldCheck}
              />
              <div className="divide-y divide-border">
                <PreferenceRow
                  id="pref-updates"
                  title="Product update notices"
                  description="Tell me when a template I own ships a new version."
                  checked={prefs?.productUpdates ?? true}
                  onChange={(v) => setPref("productUpdates", v)}
                />
                <PreferenceRow
                  id="pref-receipts"
                  title="Order receipts"
                  description="Send an itemized receipt for every order."
                  checked={prefs?.orderReceipts ?? true}
                  onChange={(v) => setPref("orderReceipts", v)}
                />
                <PreferenceRow
                  id="pref-downloads"
                  title="Download notifications"
                  description="Confirm when a download link is issued for my license."
                  checked={prefs?.downloadAlerts ?? true}
                  onChange={(v) => setPref("downloadAlerts", v)}
                />
                <PreferenceRow
                  id="pref-marketing"
                  title="New releases and offers"
                  description="Occasional emails about new templates and sales."
                  checked={prefs?.marketing ?? false}
                  onChange={(v) => setPref("marketing", v)}
                />
              </div>
              <div className="border-t border-border p-5">
                <DemoNote>
                  Preferences are stored in this browser. Email delivery is not connected yet, so
                  nothing is actually sent.
                </DemoNote>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="security" className="space-y-5">
            <DemoNote>
              Authentication is not connected in this phase. The controls below show the intended
              security surface — they do not change any credentials or sessions.
            </DemoNote>

            <Panel className="overflow-hidden">
              <PanelHeader
                title="Password"
                description="Change your sign-in password."
                icon={KeyRound}
              />
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                {[
                  ["current", "Current password"],
                  ["new", "New password"],
                  ["confirm", "Confirm new password"],
                ].map(([id, label]) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={`pw-${id}`}>{label}</Label>
                    <Input id={`pw-${id}`} type="password" disabled placeholder="••••••••" />
                  </div>
                ))}
                <div className="sm:col-span-3">
                  <Button variant="subtle" disabled>
                    Update password (not connected)
                  </Button>
                </div>
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHeader
                title="Active sessions"
                description="Devices signed in to your account."
                icon={Laptop}
              />
              <ul className="divide-y divide-border">
                {[
                  ["This browser", "Berlin, Germany · current session"],
                  ["MacBook Pro", "Berlin, Germany · sample record"],
                ].map(([name, meta]) => (
                  <li key={name} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{meta}</p>
                    </div>
                    <Button size="sm" variant="ghost" disabled>
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHeader
                title="Two-factor authentication"
                description="Adds a second step when signing in."
                icon={ShieldCheck}
              />
              <div className="flex items-center justify-between gap-4 p-5">
                <p className="text-sm text-muted-foreground">
                  Available once authentication is connected.
                </p>
                <Button size="sm" variant="subtle" disabled>
                  Set up
                </Button>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="preferences">
            <Panel className="overflow-hidden">
              <PanelHeader
                title="Appearance"
                description="Theme is shared with the whole marketplace."
                icon={Palette}
              />
              <div className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium">Dark interface</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Currently using the {theme} theme. Your choice is remembered on this device.
                  </p>
                </div>
                <Switch
                  aria-label="Toggle dark theme"
                  checked={theme === "dark"}
                  onCheckedChange={() => toggle()}
                />
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
