import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, PlugZap, Save, Scale, Store } from "lucide-react";
import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminPageHeader,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  StatsSkeleton,
  StatusBadge,
} from "@/features/admin/admin-ui";
import { storeSettingsQuery } from "@/lib/admin/queries";
import { updateStoreSettings } from "@/lib/admin/service";
import type { StoreSettings } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

const schema = z.object({
  storeName: z.string().min(2, "Enter a store name."),
  tagline: z.string().min(6, "Add a short tagline."),
  supportEmail: z.string().email("Enter a valid support email."),
  description: z.string().min(20, "Describe the store in at least 20 characters."),
  taxNote: z.string().min(6, "Add a tax note shown at checkout."),
  brandAccent: z.enum(["indigo", "violet", "cyan"]),
  legal: z.object({
    termsUrl: z.string().min(1, "Required"),
    privacyUrl: z.string().min(1, "Required"),
    refundUrl: z.string().min(1, "Required"),
    licenseUrl: z.string().min(1, "Required"),
  }),
  notifications: z.object({
    orderReceipts: z.boolean(),
    productUpdates: z.boolean(),
    moderationAlerts: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
});

type FormValues = z.infer<typeof schema>;

const toValues = (s: StoreSettings): FormValues => ({
  storeName: s.storeName,
  tagline: s.tagline,
  supportEmail: s.supportEmail,
  description: s.description,
  taxNote: s.taxNote,
  brandAccent: s.brandAccent,
  legal: { ...s.legal },
  notifications: { ...s.notifications },
});

const notificationCopy: { key: keyof FormValues["notifications"]; label: string; hint: string }[] = [
  {
    key: "orderReceipts",
    label: "Order receipts",
    hint: "Email a receipt and license summary after each successful order.",
  },
  {
    key: "productUpdates",
    label: "Product update notices",
    hint: "Notify owners when a template they purchased ships a new version.",
  },
  {
    key: "moderationAlerts",
    label: "Moderation alerts",
    hint: "Alert operators when a review is reported or awaits a decision.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    hint: "Send the team a Monday summary of revenue, orders and refunds.",
  },
];

function AdminSettings() {
  const { data, isPending, isError, refetch } = useQuery(storeSettingsQuery());

  if (isError) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Configuration"
          title="Store settings"
          description="Storefront identity, licensing copy, operator notifications and integration status."
          breadcrumbs={[{ label: "Settings" }]}
        />
        <ErrorState onRetry={() => void refetch()} />
      </>
    );
  }

  if (isPending || !data) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Configuration"
          title="Store settings"
          description="Storefront identity, licensing copy, operator notifications and integration status."
          breadcrumbs={[{ label: "Settings" }]}
        />
        <StatsSkeleton count={3} />
      </>
    );
  }

  return <SettingsForm settings={data} />;
}

function SettingsForm({ settings: data }: { settings: StoreSettings }) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: toValues(data),
  });

  useEffect(() => {
    form.reset(toValues(data));
  }, [data, form]);

  const save = useMutation({
    mutationFn: (values: FormValues) => updateStoreSettings(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });
      toast.success("Store settings saved", {
        description: "Stored in this browser until the settings API is connected.",
      });
    },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Storefront identity, licensing copy, operator notifications and integration status."
        breadcrumbs={[{ label: "Settings" }]}
      />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => save.mutate(values))}
          className="space-y-5"
          noValidate
        >
          <Tabs defaultValue="store">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="store">Storefront</TabsTrigger>
              <TabsTrigger value="legal">Legal & licensing</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="store" className="mt-5">
              <Panel>
                <PanelHeader
                  title="Storefront identity"
                  description="Shown across the public marketplace and receipts"
                  icon={Store}
                />
                <div className="grid gap-5 p-5 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Support email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Store description</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormDescription>
                          Used for search metadata and the about page introduction.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brandAccent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand accent</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="indigo">Electric indigo</SelectItem>
                            <SelectItem value="violet">Violet</SelectItem>
                            <SelectItem value="cyan">Cyan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" value="USD" readOnly aria-readonly />
                    <p className="text-xs text-muted-foreground">
                      Multi-currency pricing arrives with the payment provider.
                    </p>
                  </div>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="legal" className="mt-5">
              <Panel>
                <PanelHeader
                  title="Legal & licensing"
                  description="Links and copy referenced at checkout"
                  icon={Scale}
                />
                <div className="grid gap-5 p-5 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="taxNote"
                    render={({ field }) => (
                      <FormItem className="lg:col-span-2">
                        <FormLabel>Tax note</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Displayed near the checkout total. Not legal advice.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {(
                    [
                      ["legal.termsUrl", "Terms URL"],
                      ["legal.privacyUrl", "Privacy URL"],
                      ["legal.refundUrl", "Refund policy URL"],
                      ["legal.licenseUrl", "License terms URL"],
                    ] as const
                  ).map(([name, label]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="notifications" className="mt-5">
              <Panel>
                <PanelHeader
                  title="Notifications"
                  description="Which messages the store sends once email is connected"
                  icon={Bell}
                />
                <ul className="divide-y divide-border">
                  {notificationCopy.map((row) => (
                    <li key={row.key}>
                      <FormField
                        control={form.control}
                        name={`notifications.${row.key}`}
                        render={({ field }) => (
                          <FormItem className="flex items-start justify-between gap-4 px-5 py-4">
                            <div className="min-w-0">
                              <FormLabel className="text-sm">{row.label}</FormLabel>
                              <FormDescription>{row.hint}</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </li>
                  ))}
                </ul>
              </Panel>
            </TabsContent>

            <TabsContent value="integrations" className="mt-5 space-y-4">
              <Panel>
                <PanelHeader
                  title="Integrations"
                  description="Services this workspace will depend on"
                  icon={PlugZap}
                />
                <ul className="divide-y divide-border">
                  {data.integrations.map((integration) => (
                    <li
                      key={integration.id}
                      className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{integration.name}</p>
                          <StatusBadge tone={integration.connected ? "success" : "warning"}>
                            {integration.connected ? "Connected" : "Not connected"}
                          </StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{integration.purpose}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{integration.note}</p>
                      </div>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() =>
                          toast.info(`${integration.name} is not connected`, {
                            description: integration.note,
                          })
                        }
                      >
                        Details
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
              <DemoNote>
                Payments, private storage, email and webhooks are intentionally unconnected in this
                phase. Each becomes a real credential-backed integration in the backend phase.
              </DemoNote>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={save.isPending}>
              <Save /> {save.isPending ? "Saving…" : "Save settings"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => form.reset(toValues(data))}>
              Reset changes
            </Button>
          </div>
        </form>
      </Form>

      <DemoNote>
        Settings persist in this browser only. Connecting the admin API makes them workspace-wide and
        audited.
      </DemoNote>
    </>
  );
}
