import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, FolderTree, Plus, Tags } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminPageHeader,
  DataTable,
  DemoNote,
  ErrorState,
  FilterBar,
  Panel,
  PanelHeader,
  StatusBadge,
  TableSkeleton,
  type Column,
} from "@/features/admin/admin-ui";
import { adminCategoriesQuery, adminTagsQuery } from "@/lib/admin/queries";
import { archiveCategory, createCategory, updateCategory } from "@/lib/admin/service";
import type { AdminCategory } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery(adminCategoriesQuery());
  const { data: tags } = useQuery(adminTagsQuery());
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });

  const archive = useMutation({
    mutationFn: archiveCategory,
    onSuccess: async () => {
      await invalidate();
      toast.success("Category archived locally");
    },
  });

  const rows = (data ?? []).filter((c) =>
    search.trim()
      ? `${c.name} ${c.slug} ${c.description}`.toLowerCase().includes(search.trim().toLowerCase())
      : true,
  );

  const columns: Column<AdminCategory>[] = [
    {
      key: "name",
      header: "Category",
      cell: (c) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setEditing(c)}
            className="block max-w-full truncate text-left text-sm font-medium transition-colors hover:text-brand"
          >
            {c.name}
          </button>
          <p className="truncate font-mono text-[11px] text-muted-foreground">/{c.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (c) => (
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{c.description}</p>
      ),
      className: "hidden xl:table-cell",
      headerClassName: "hidden xl:table-cell",
    },
    {
      key: "count",
      header: "Products",
      cell: (c) => <span className="font-mono text-sm tabular-nums">{c.productCount}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <StatusBadge tone={c.status === "active" ? "success" : "neutral"}>
          {c.status === "active" ? "Active" : "Archived"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "sr-only",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>
            Edit
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/categories/$slug" params={{ slug: c.slug }}>
              View
            </Link>
          </Button>
          {c.status === "active" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Archive ${c.name}`}
              onClick={() => archive.mutate(c.slug)}
            >
              <Archive />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories & tags"
        description="Organise the storefront taxonomy: category descriptions, search metadata and the tag vocabulary products share."
        breadcrumbs={[{ label: "Categories & tags" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setDraft({ name: "", description: "" });
              setError("");
              setCreating(true);
            }}
          >
            <Plus /> New category
          </Button>
        }
      />

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search categories"
          label="Search categories"
        />
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={6} cols={4} />
        </Panel>
      ) : (
        <Panel>
          <PanelHeader
            title="Categories"
            description={`${rows.length} of ${data?.length ?? 0} shown. Product counts come from the live catalog.`}
            icon={FolderTree}
          />
          <DataTable
            caption="Storefront categories"
            columns={columns}
            rows={rows}
            getRowId={(c) => c.slug}
            mobileRow={(c) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="min-w-0 text-left text-sm font-medium"
                  >
                    {c.name}
                  </button>
                  <StatusBadge tone={c.status === "active" ? "success" : "neutral"}>
                    {c.status === "active" ? "Active" : "Archived"}
                  </StatusBadge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.description}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  /{c.slug} · {c.productCount} products
                </p>
              </div>
            )}
          />
        </Panel>
      )}

      <Panel>
        <PanelHeader
          title="Tag vocabulary"
          description="Tags in use across the catalog, with product counts."
          icon={Tags}
        />
        <div className="flex flex-wrap gap-2 p-5">
          {(tags ?? []).map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2/60 px-2 py-1 text-xs"
            >
              {tag.name}
              <span className="font-mono text-[10px] text-muted-foreground">{tag.usage}</span>
            </span>
          ))}
        </div>
        <div className="border-t border-border p-5">
          <DemoNote>
            Tags are derived from product records. Renaming or merging tags across the catalog will be
            available once the catalog API is connected.
          </DemoNote>
        </div>
      </Panel>

      {/* Create */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>
              Categories group products on the storefront and in search filters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Healthcare"
              />
              {draft.name && (
                <p className="font-mono text-[11px] text-muted-foreground">
                  /{slugify(draft.name)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (draft.name.trim().length < 3 || draft.description.trim().length < 20) {
                  setError("Add a name of at least 3 characters and a description of at least 20.");
                  return;
                }
                const slug = slugify(draft.name);
                await createCategory({
                  slug,
                  name: draft.name.trim(),
                  description: draft.description.trim(),
                  status: "active",
                  seoTitle: `${draft.name.trim()} templates — DevAssets`,
                  seoDescription: draft.description.trim().slice(0, 155),
                });
                await invalidate();
                setCreating(false);
                toast.success(`${draft.name.trim()} created locally`);
              }}
            >
              Create category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.name}</DialogTitle>
            <DialogDescription>
              Update the storefront copy and search metadata for this category.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-seo">SEO description</Label>
                <Textarea
                  id="edit-seo"
                  rows={2}
                  value={editing.seoDescription}
                  onChange={(e) => setEditing({ ...editing, seoDescription: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editing) return;
                await updateCategory(editing.slug, {
                  name: editing.name,
                  description: editing.description,
                  seoDescription: editing.seoDescription,
                });
                await invalidate();
                setEditing(null);
                toast.success("Category saved locally");
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
