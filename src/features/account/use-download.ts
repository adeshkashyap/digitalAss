import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { accountKeys } from "@/lib/account/queries";
import { recordDownload } from "@/lib/account/service";
import type { DownloadFile } from "@/lib/account/types";
import { productById } from "@/lib/catalog/products";

/**
 * Local download action. It records the event and reports progress honestly:
 * no file is transferred because artifact storage and signed URLs arrive with
 * the backend phase.
 */
export function useDownloadAction() {
  const queryClient = useQueryClient();
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (args: { purchaseId: string; productId: string; file: DownloadFile }) =>
      recordDownload(args),
    onMutate: (args) => setPendingFileId(args.file.id),
    onSuccess: (_event, args) => {
      const product = productById(args.productId);
      toast.success(`${args.file.label} prepared`, {
        description: `${product?.name ?? "Template"} v${args.file.version} — demo download only, no file was transferred yet.`,
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
