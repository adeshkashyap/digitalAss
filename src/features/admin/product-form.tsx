import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { adminCategoriesQuery } from "@/lib/admin/queries";
import type { AdminProduct, ProductDraftInput, ProductStatus } from "@/lib/admin/types";
import { licenses } from "@/lib/catalog/licenses";
import type { LicenseId } from "@/lib/catalog/types";
import { DemoNote, Panel, PanelHeader } from "./admin-ui";

const schema = z.object({
  name: z.string().min(3, "Give the product a name of at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  tagline: z.string().min(8, "Add a short tagline"),
  summary: z.string().min(20, "Add a summary of at least 20 characters"),
  description: z.string().min(40, "Add a description of at least 40 characters"),
  categorySlug: z.string().min(1, "Choose a category"),
  tags: z.string(),
  tech: z.string().min(2, "List at least one technology"),
  price: z.coerce.number().min(1, "Price must be at least $1").max(2000),
  salePrice: z.union([z.coerce.number().min(0).max(2000), z.literal("")]).optional(),
  status: z.enum(["published", "draft", "archived"]),
  featured: z.boolean(),
  version: z.string().min(1, "Version is required"),
  changelog: z.string(),
  requirements: z.string(),
  included: z.string(),
  licenseIds: z.array(z.enum(["personal", "commercial", "agency"])).min(1, "Enable a license"),
  demoUrl: z.string().url("Enter a valid URL"),
  docsUrl: z.string().url("Enter a valid URL"),
  seoTitle: z.string().max(70, "Keep the SEO title under 70 characters"),
  seoDescription: z.string().max(180, "Keep the SEO description under 180 characters"),
});

type FormValues = z.input<typeof schema>;
type ParsedValues = z.output<typeof schema>;

const lines = (value: string) =>
  value
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

const commas = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function toDraft(values: ParsedValues): ProductDraftInput {
  const draft: ProductDraftInput = {
    name: values.name,
    slug: values.slug,
    tagline: values.tagline,
    summary: values.summary,
    description: values.description,
    categorySlug: values.categorySlug,
    tags: commas(values.tags),
    tech: commas(values.tech),
    price: values.price,
    status: values.status,
    featured: values.featured,
    version: values.version,
    changelog: values.changelog,
    requirements: lines(values.requirements),
    included: lines(values.included),
    licenseIds: values.licenseIds as LicenseId[],
    demoUrl: values.demoUrl,
    docsUrl: values.docsUrl,
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
  };
  if (typeof values.salePrice === "number" && values.salePrice > 0) {
    draft.salePrice = values.salePrice;
  }
  return draft;
}

function defaults(product?: AdminProduct): FormValues {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    tagline: product?.tagline ?? "",
    summary: product?.summary ?? "",
    description: (product?.description ?? []).join("\n\n"),
    categorySlug: product?.categorySlug ?? "",
    tags: (product?.tags ?? []).join(", "),
    tech: (product?.tech ?? []).join(", "),
    price: product?.price ?? 79,
    salePrice: product?.salePrice ?? "",
    status: product?.status ?? "draft",
    featured: product?.featured ?? false,
    version: product?.version ?? "1.0.0",
    changelog: product?.versions.find((v) => v.current)?.changelog ?? "",
    requirements: (product?.requirements ?? []).join("\n"),
    included: (product?.included ?? []).join("\n"),
    licenseIds: product?.licenseIds ?? ["personal", "commercial", "agency"],
    demoUrl: product?.demoUrl ?? "https://demo.devassets.io/",
    docsUrl: product?.docsUrl ?? "https://docs.devassets.io/",
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? "",
  };
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const statuses: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function ProductForm({
  product,
  submitLabel,
  onSubmit,
}: {
  product?: AdminProduct;
  submitLabel: string;
  onSubmit: (draft: ProductDraftInput) => Promise<void>;
}) {
  const { data: categories } = useQuery(adminCategoriesQuery());
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults(product),
    mode: "onSubmit",
  });
  const { register, handleSubmit, watch, setValue, formState } = form;
  const errors = formState.errors;
  const licenseIds = watch("licenseIds");

  const submit = handleSubmit(async (values) => {
    await onSubmit(toDraft(schema.parse(values)));
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Tabs defaultValue="content">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="pricing">Pricing &amp; licensing</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6 space-y-6">
          <Panel>
            <PanelHeader title="Product identity" description="Shown across the storefront." />
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <Field label="Name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" {...register("name")} placeholder="React Admin Pro" />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                hint="Used in the product URL."
                error={errors.slug?.message}
              >
                <Input id="slug" {...register("slug")} placeholder="react-admin-pro" />
              </Field>
              <Field label="Tagline" htmlFor="tagline" error={errors.tagline?.message}>
                <Input id="tagline" {...register("tagline")} />
              </Field>
              <Field label="Category" htmlFor="categorySlug" error={errors.categorySlug?.message}>
                <Select
                  value={watch("categorySlug")}
                  onValueChange={(v) => setValue("categorySlug", v, { shouldValidate: true })}
                >
                  <SelectTrigger id="categorySlug">
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Summary"
                htmlFor="summary"
                hint="One or two sentences for cards and search results."
                error={errors.summary?.message}
              >
                <Textarea id="summary" rows={3} {...register("summary")} />
              </Field>
              <Field
                label="Description"
                htmlFor="description"
                hint="Separate paragraphs with a blank line."
                error={errors.description?.message}
              >
                <Textarea id="description" rows={3} {...register("description")} />
              </Field>
              <Field
                label="Technologies"
                htmlFor="tech"
                hint="Comma separated, e.g. React, TypeScript, Tailwind."
                error={errors.tech?.message}
              >
                <Input id="tech" {...register("tech")} />
              </Field>
              <Field
                label="Tags"
                htmlFor="tags"
                hint="Comma separated discovery keywords."
                error={errors.tags?.message}
              >
                <Input id="tags" {...register("tags")} />
              </Field>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6 space-y-6">
          <Panel>
            <PanelHeader title="Pricing" description="Prices are in USD." />
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <Field label="Base price (USD)" htmlFor="price" error={errors.price?.message}>
                <Input id="price" type="number" min={1} step={1} {...register("price")} />
              </Field>
              <Field
                label="Sale price (optional)"
                htmlFor="salePrice"
                hint="Leave blank for no sale."
                error={errors.salePrice?.message}
              >
                <Input id="salePrice" type="number" min={0} step={1} {...register("salePrice")} />
              </Field>
              <Field label="Status" htmlFor="status" error={errors.status?.message}>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as ProductStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-2/40 px-4 py-3">
                <div>
                  <Label htmlFor="featured">Feature on the homepage</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Featured products appear in curated storefront rows.
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={watch("featured")}
                  onCheckedChange={(v) => setValue("featured", v)}
                />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Licenses offered"
              description="Customers choose one of the enabled licenses at checkout."
            />
            <div className="space-y-3 p-5">
              {licenses.map((license) => {
                const id = license.id as LicenseId;
                const checked = licenseIds.includes(id);
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-surface-2/30 px-4 py-3"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setValue(
                          "licenseIds",
                          v === true
                            ? [...licenseIds, id]
                            : licenseIds.filter((l) => l !== id),
                          { shouldValidate: true },
                        )
                      }
                      aria-label={`Offer the ${license.name} license`}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{license.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {license.blurb} · price ×{license.multiplier}
                      </span>
                    </span>
                  </label>
                );
              })}
              {errors.licenseIds && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.licenseIds.message}
                </p>
              )}
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="delivery" className="mt-6 space-y-6">
          <Panel>
            <PanelHeader title="Version & files" description="What the customer receives." />
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <Field label="Version" htmlFor="version" error={errors.version?.message}>
                <Input id="version" {...register("version")} placeholder="2.4.0" />
              </Field>
              <Field
                label="Changelog for this version"
                htmlFor="changelog"
                error={errors.changelog?.message}
              >
                <Textarea id="changelog" rows={3} {...register("changelog")} />
              </Field>
              <Field
                label="What's included"
                htmlFor="included"
                hint="One item per line."
                error={errors.included?.message}
              >
                <Textarea id="included" rows={4} {...register("included")} />
              </Field>
              <Field
                label="Requirements"
                htmlFor="requirements"
                hint="One item per line."
                error={errors.requirements?.message}
              >
                <Textarea id="requirements" rows={4} {...register("requirements")} />
              </Field>
              <Field label="Live demo URL" htmlFor="demoUrl" error={errors.demoUrl?.message}>
                <Input id="demoUrl" {...register("demoUrl")} />
              </Field>
              <Field label="Documentation URL" htmlFor="docsUrl" error={errors.docsUrl?.message}>
                <Input id="docsUrl" {...register("docsUrl")} />
              </Field>
            </div>
            <div className="border-t border-border p-5">
              <DemoNote>
                File uploads are not available in this phase. Source archives, documentation bundles
                and screenshots will be attached once secure storage and signed URLs are connected.
              </DemoNote>
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="seo" className="mt-6 space-y-6">
          <Panel>
            <PanelHeader
              title="Search metadata"
              description="Used for the product page title and description."
            />
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <Field label="SEO title" htmlFor="seoTitle" error={errors.seoTitle?.message}>
                <Input id="seoTitle" {...register("seoTitle")} />
              </Field>
              <Field
                label="SEO description"
                htmlFor="seoDescription"
                error={errors.seoDescription?.message}
              >
                <Textarea id="seoDescription" rows={3} {...register("seoDescription")} />
              </Field>
            </div>
          </Panel>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          {submitLabel}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link to="/admin/products">Cancel</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Saved to this browser only until the API is connected.
        </p>
      </div>
    </form>
  );
}
