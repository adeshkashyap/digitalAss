import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { accountKeys, downloadsQuery, purchasesQuery } from "@/lib/account/queries";
import { recordDownload } from "@/lib/account/service";
import type { DownloadFile } from "@/lib/account/types";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

/** Records a download event and opens a signed URL when storage is configured. */
export function useDownloadAction() {
  const queryClient = useQueryClient();
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const downloadsQ = useQuery(downloadsQuery());
  const purchasesQ = useQuery(purchasesQuery());
  const productIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of downloadsQ.data ?? []) ids.add(item.productId);
    for (const purchase of purchasesQ.data ?? []) ids.add(purchase.productId);
    return [...ids];
  }, [downloadsQ.data, purchasesQ.data]);
  const { productsById } = useProductsByIds(productIds);

  const mutation = useMutation({
    mutationFn: (args: { purchaseId: string; productId: string; file: DownloadFile }) =>
      recordDownload(args),
    onMutate: (args) => setPendingFileId(args.file.id),
    onSuccess: (event, args) => {
      const product = productsById.get(args.productId);
      if (event.downloadUrl) {
        window.open(event.downloadUrl, "_blank", "noopener,noreferrer");
        toast.success(`${args.file.label} ready`, {
          description: `${product?.name ?? "Template"} v${args.file.version} opened in a new tab.`,
        });
        return;
      }
      toast.error("File not available yet", {
        description: `${product?.name ?? "Template"} — upload the archive to Cloud Storage first.`,
      });
    },
    onError: () =>
      toast.error("Download couldn't be prepared", {
        description: "Try again in a moment.",
      }),
    onSettled: () => {
      setPendingFileId(null);
      void queryClient.invalidateQueries({ queryKey: accountKeys.downloads });
      void queryClient.invalidateQueries({ queryKey: accountKeys.downloadHistory });
      void queryClient.invalidateQueries({ queryKey: accountKeys.purchases });
    },
  });

  return {
    pendingFileId,
    download: (purchaseId: string, productId: string, file: DownloadFile) => {
      toast.loading(`Preparing ${file.label}…`, { id: file.id, duration: 900 });
      mutation.mutate({ purchaseId, productId, file });
    },
  };
}
