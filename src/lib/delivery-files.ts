export type DeliveryFileRecord = {
  id: string;
  group: "source" | "docs" | "assets";
  name: string;
  type: string;
  size: string;
  objectPath: string;
  status: "ready" | "pending" | "missing";
};

export function defaultDeliveryFiles(slug: string, version: string): DeliveryFileRecord[] {
  const v = version.replace(/^v/i, "");
  return [
    {
      id: `${slug}-src`,
      group: "source",
      name: "Source archive",
      type: "ZIP",
      size: "—",
      objectPath: `products/${slug}/v${v}/source.zip`,
      status: "ready",
    },
    {
      id: `${slug}-docs`,
      group: "docs",
      name: "Documentation",
      type: "PDF",
      size: "—",
      objectPath: `products/${slug}/v${v}/docs.pdf`,
      status: "ready",
    },
  ];
}

export function parseDeliveryFiles(value: unknown): DeliveryFileRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row) => row && typeof row === "object") as DeliveryFileRecord[];
}

export function customerDownloadFiles(
  records: DeliveryFileRecord[],
  version: string,
  includeAssets: boolean,
) {
  const ready = records.filter((f) => f.status === "ready");
  const filtered = includeAssets ? ready : ready.filter((f) => f.group !== "assets");
  return filtered.map((f) => ({
    id: f.id,
    kind: f.group === "source" ? "source" : f.group === "docs" ? "docs" : "assets",
    label: f.name,
    fileName: f.objectPath.split("/").pop() ?? f.name,
    fileType: f.type,
    size: f.size,
    version,
    objectPath: f.objectPath,
  }));
}
