import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Archive,
  CircleDollarSign,
  Download,
  ExternalLink,
  FileArchive,
  History,
  Package,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminThumb,
  ConfirmDialog,
  DemoNote,
  DetailRow,
  ErrorState,
  Panel,
  PanelHeader,
  StatusBadge,
  productStatusLabel,
  productStatusTone,
} from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { adminProductQuery } from "@/lib/admin/queries";
import {
  deleteProduct,
  formatMoney,
  formatNumber,
  setProductFeatured,
  setProductStatus,
  updateProduct,
} from "@/lib/admin/service";
import { licenseById } from "@/lib/catalog/licenses";

export const Route = createFileRoute("/admin/products/$productId")({ component: ManageProduct });

const fileTone = { ready: "success", pending: "warning", missing: "danger" } as const;

function ManageProduct() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isPending, isError, refetch } = useQuery(adminProductQuery(productId));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });

  const statusChange = useMutation({
    mutationFn: (next: "published" | "draft" | "archived") => setProductStatus(productId, next),
    onSuccess: async (_d, next) => {
      await invalidate();
      toast.success(`Status set to ${next}`, {
        description: "Stored locally in the demo workspace.",
      });
    },
  });

  const featureToggle = useMutation({
    mutationFn: (next: boolean) => setProductFeatured(productId, next),
    onSuccess: async (_d, next) => {
      await invalidate();
      toast.success(next ? "Added to featured" : "Removed from featured");
    },
  });

  if (isError) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Catalog"
          title="Product"
          description="Manage this asset's content, pricing, delivery and performance."
          breadcrumbs={[{ label: "Products", to: "/admin/products" }, { label: "Product" }]}
        />
        <ErrorState onRetry={() => void refetch()} />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Catalog"
          title="Product not found"
          description="This product is not in the workspace. It may have been deleted locally."
          breadcrumbs={[{ label: "Products", to: "/admin/products" }, { label: "Not found" }]}
        />
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No product with this reference"
          description="Return to the catalog list to pick an existing product."
          action={
            <Button asChild>
              <Link to="/admin/products">Back to products</Link>
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title={product.name}
        description={product.tagline}
        breadcrumbs={[{ label: "Products", to: "/admin/products" }, { label: product.name }]}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/templates/$slug" params={{ slug: product.slug }}>
                <ExternalLink /> Storefront
              </Link>
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => featureToggle.mutate(!product.featured)}
            >
              <Star /> {product.featured ? "Unfeature" : "Feature"}
            </Button>
            {product.status === "published" ? (
              <Button variant="subtle" size="sm" onClick={() => statusChange.mutate("draft")}>
                Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={() => statusChange.mutate("published")}>
                Publish
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              label="Revenue"
              value={formatMoney(product.revenue)}
              icon={CircleDollarSign}
            />
            <AdminStatCard label="Sales" value={formatNumber(product.sales)} icon={Package} />
            <AdminStatCard
              label="Downloads"
              value={formatNumber(product.downloads)}
              icon={Download}
            />
            <AdminStatCard
              label="Rating"
              value={product.rating ? product.rating.toFixed(1) : "—"}
              hint={`${product.reviewCount} reviews`}
              icon={Star}
              to="/admin/reviews"
            />
          </div>

          <Tabs defaultValue="edit">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="danger">Danger zone</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-6">
              <ProductForm
                product={product}
                submitLabel="Save changes"
                onSubmit={async (draft) => {
                  await updateProduct(product.id, draft);
                  await invalidate();
                  toast.success("Product saved", {
                    description: "Changes are stored in this browser only.",
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-6 space-y-4">
              <Panel>
                <PanelHeader
                  title="Deliverables"
                  description="What customers receive after purchase."
                  icon={FileArchive}
                  action={
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() =>
                        toast.info("Uploads are not available yet", {
                          description:
                            "Archive uploads require secure storage and signed URLs, which arrive with the backend phase.",
                        })
                      }
                    >
                      <Upload /> Upload
                    </Button>
                  }
                />
                {product.files.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground">
                    No files are attached to this product in the demo workspace.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {product.files.map((file) => (
                      <li key={file.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {file.group} · {file.type} · {file.size}
                          </p>
                        </div>
                        <StatusBadge tone={fileTone[file.status]}>
                          {file.status === "ready"
                            ? "Ready"
                            : file.status === "pending"
                              ? "Pending"
                              : "Missing"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-border p-5">
                  <DemoNote>
                    File records are metadata only. No archive is stored, so downloads in the
                    customer area remain demonstrations.
                  </DemoNote>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
              <Panel>
                <PanelHeader
                  title="Release history"
                  description="Version entitlements shown to customers."
                  icon={History}
                />
                <ol className="divide-y divide-border">
                  {product.versions.map((version) => (
                    <li key={version.version} className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm">v{version.version}</span>
                        {version.current && <StatusBadge tone="success">Current</StatusBadge>}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {version.releasedAt}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {version.changelog}
                      </p>
                    </li>
                  ))}
                </ol>
              </Panel>
            </TabsContent>

            <TabsContent value="danger" className="mt-6 space-y-4">
              <Panel>
                <PanelHeader
                  title="Archive or delete"
                  description="Archiving hides the product from the storefront but keeps its records."
                  icon={Archive}
                />
                <div className="flex flex-wrap gap-3 p-5">
                  <Button variant="subtle" onClick={() => statusChange.mutate("archived")}>
                    <Archive /> Archive product
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                    <Trash2 /> Delete product
                  </Button>
                </div>
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Panel className="overflow-hidden">
            <div className="border-b border-border bg-surface-2/30 p-4">
              <AdminThumb preview={product.preview} tint={product.tint} slug={product.slug} />
            </div>
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={productStatusTone[product.status]}>
                  {productStatusLabel[product.status]}
                </StatusBadge>
                {product.featured && <StatusBadge tone="brand">Featured</StatusBadge>}
              </div>
              <RatingStars rating={product.rating} count={product.reviewCount} />
              <dl>
                <DetailRow label="Price">
                  <span className="font-mono tabular-nums">
                    {formatMoney(product.salePrice ?? product.price)}
                  </span>
                </DetailRow>
                <DetailRow label="Version">
                  <span className="font-mono">{product.version}</span>
                </DetailRow>
                <DetailRow label="Updated">{product.updatedAt}</DetailRow>
                <DetailRow label="Created">{product.createdAt}</DetailRow>
                <DetailRow label="Screenshots">{product.screenshots}</DetailRow>
                <DetailRow label="Licenses">
                  {product.licenseIds.map((id) => licenseById(id)?.name ?? id).join(", ")}
                </DetailRow>
              </dl>
              <div className="flex flex-wrap gap-1.5">
                {product.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          {product.attention.length > 0 && (
            <Panel>
              <PanelHeader title="Warnings" description="Surfaced in the operations queue." />
              <ul className="space-y-2 p-5 text-sm text-muted-foreground">
                {product.attention.map((item) => (
                  <li key={item} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${product.name}?`}
        description="The product is removed from this local demo workspace. Order and download history stays intact."
        confirmLabel="Delete product"
        destructive
        onConfirm={async () => {
          setConfirmDelete(false);
          await deleteProduct(product.id);
          await invalidate();
          toast.success(`${product.name} deleted locally`);
          await navigate({ to: "/admin/products" });
        }}
      />
    </>
  );
}
