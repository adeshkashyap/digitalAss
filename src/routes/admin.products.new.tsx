import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AdminPageHeader, DemoNote } from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { createProduct } from "@/lib/admin/service";

export const Route = createFileRoute("/admin/products/new")({ component: NewProduct });

function NewProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Create product"
        description="Draft a new marketplace asset: identity, pricing, licensing, delivery notes and search metadata."
        breadcrumbs={[{ label: "Products", to: "/admin/products" }, { label: "New" }]}
      />

      <DemoNote>
        New products are saved to this browser only. Screenshots and downloadable archives cannot be
        uploaded until secure storage is connected.
      </DemoNote>

      <ProductForm
        submitLabel="Create product"
        onSubmit={async (draft) => {
          const product = await createProduct(draft);
          await queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });
          toast.success(`${product.name} created`, {
            description: "Saved locally as a demo record.",
          });
          await navigate({ to: "/admin/products/$productId", params: { productId: product.id } });
        }}
      />
    </>
  );
}
