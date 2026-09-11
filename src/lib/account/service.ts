/**
 * Customer account service boundary.
 *
 * Every function below is the local stand-in for one future REST endpoint:
 *
 *   getCurrentUser      -> GET   /api/me
 *   updateProfile       -> PATCH /api/me/profile
 *   updatePreferences   -> PATCH /api/me/profile
 *   getPurchases        -> GET   /api/me/purchases
 *   getDownloads        -> GET   /api/me/downloads
 *   recordDownload      -> POST  /api/me/downloads/:purchaseId
 *   getDownloadHistory  -> GET   /api/me/downloads/history
 *   getOrders           -> GET   /api/me/orders
 *   getOrder            -> GET   /api/me/orders/:id
 *   getLicenses         -> GET   /api/me/licenses
 *   getNotifications    -> GET   /api/me/notifications
 *   markNotification*   -> PATCH /api/me/notifications
 *   getSupportTickets   -> GET   /api/support/tickets
 *   createSupportTicket -> POST  /api/support/tickets
 *
 * Signatures and return types are already async, so swapping the in-memory
 * repository for `fetch` calls is a single-file change. Nothing here writes to
 * a server: state lives in memory plus localStorage for the current browser.
 */
import { productById } from "@/lib/catalog/products";
import {
  filesFor,
  mockDownloadHistory,
  mockLicenses,
  mockNotifications,
  mockOrders,
  mockPurchases,
  mockRecentlyViewedSlugs,
  mockTickets,
  mockUser,
} from "./mock-data";
import type {
  AccountNotification,
  CustomerUser,
  DownloadEvent,
  DownloadFile,
  DownloadItem,
  LicenseRecord,
  Order,
  Purchase,
  SupportTicket,
  TicketCategory,
} from "./types";

const STORAGE_KEY = "devassets.account.v1";
/** Simulated network latency so loading states are real, not decorative. */
const LATENCY = 260;

type StoredUser = {
  [K in keyof CustomerUser]?: CustomerUser[K] | undefined;
};

interface PersistedState {
  user?: StoredUser | undefined;
  readNotificationIds?: string[] | undefined;
  hiddenNotificationIds?: string[] | undefined;
  downloadHistory?: DownloadEvent[] | undefined;
  tickets?: SupportTicket[] | undefined;
  lastDownloadedAt?: Record<string, string> | undefined;
}

let persisted: PersistedState | null = null;

function load(): PersistedState {
  if (persisted) return persisted;
  if (typeof window === "undefined") return (persisted = {});
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    persisted = raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    persisted = {};
  }
  return persisted;
}

function save(next: PersistedState) {
  persisted = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — in-memory state still applies for this session */
  }
}

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));

/* -------------------------------------------------------------- identity */

/** Drops undefined entries so stored overrides never blank out a required field. */
function defined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export async function getCurrentUser(): Promise<CustomerUser> {
  const state = load();
  return delay({
    ...mockUser,
    ...(defined(state.user) as Omit<Partial<CustomerUser>, "preferences">),
    preferences: { ...mockUser.preferences, ...state.user?.preferences },
  });
}

export interface ProfileInput {
  name: string;
  email: string;
  company?: string | undefined;
  location?: string | undefined;
  timezone?: string | undefined;
  language?: string | undefined;
}

export async function updateProfile(input: ProfileInput): Promise<CustomerUser> {
  const state = load();
  save({ ...state, user: { ...state.user, ...input } });
  return getCurrentUser();
}

export async function updatePreferences(
  preferences: Partial<CustomerUser["preferences"]>,
): Promise<CustomerUser> {
  const state = load();
  save({
    ...state,
    user: {
      ...state.user,
      preferences: { ...mockUser.preferences, ...state.user?.preferences, ...preferences },
    },
  });
  return getCurrentUser();
}

/* ------------------------------------------------------------- purchases */

function purchasesWithLocalState(): Purchase[] {
  const stamps = load().lastDownloadedAt ?? {};
  return mockPurchases.map((p) => {
    const at = stamps[p.id] ?? p.lastDownloadedAt;
    return at ? { ...p, lastDownloadedAt: at } : { ...p };
  });
}

export async function getPurchases(): Promise<Purchase[]> {
  return delay(
    purchasesWithLocalState().sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)),
  );
}

export const purchaseHasUpdate = (purchase: Purchase) => {
  const product = productById(purchase.productId);
  return !!product && product.version !== purchase.ownedVersion;
};

/* ------------------------------------------------------------- downloads */

function toDownloadItem(purchase: Purchase): DownloadItem {
  const product = productById(purchase.productId);
  const latestVersion = product?.version ?? purchase.ownedVersion;
  const item: DownloadItem = {
    purchaseId: purchase.id,
    productId: purchase.productId,
    license: purchase.license,
    latestVersion,
    ownedVersion: purchase.ownedVersion,
    updateAvailable: latestVersion !== purchase.ownedVersion,
    files: filesFor(product?.slug ?? purchase.productId, latestVersion, {
      assets: purchase.license !== "personal",
      sizeMb: 8 + ((product?.pages ?? 20) % 7) * 3.5,
    }),
  };
  if (purchase.lastDownloadedAt) item.lastDownloadedAt = purchase.lastDownloadedAt;
  return item;
}

export async function getDownloads(): Promise<DownloadItem[]> {
  return delay(
    purchasesWithLocalState()
      .filter((p) => !p.archived)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
      .map(toDownloadItem),
  );
}

export async function getDownloadHistory(): Promise<DownloadEvent[]> {
  const state = load();
  const events = [...(state.downloadHistory ?? []), ...mockDownloadHistory];
  return delay(events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 24));
}

/**
 * Records a download locally. In production this will call the API, which
 * returns a short-lived signed URL for the stored artifact.
 */
export async function recordDownload(args: {
  purchaseId: string;
  productId: string;
  file: DownloadFile;
}): Promise<DownloadEvent> {
  const now = new Date().toISOString();
  const event: DownloadEvent = {
    id: `dl-local-${Date.now()}`,
    at: now,
    productId: args.productId,
    version: args.file.version,
    fileLabel: args.file.label,
    status: "completed",
  };
  const state = load();
  save({
    ...state,
    downloadHistory: [event, ...(state.downloadHistory ?? [])].slice(0, 40),
    lastDownloadedAt: { ...state.lastDownloadedAt, [args.purchaseId]: now },
  });
  await delay(null);
  return event;
}

/* ---------------------------------------------------------------- orders */

export async function getOrders(): Promise<Order[]> {
  return delay([...mockOrders].sort((a, b) => b.placedAt.localeCompare(a.placedAt)));
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  return delay(mockOrders.find((o) => o.id === orderId));
}

/* -------------------------------------------------------------- licenses */

export async function getLicenses(): Promise<LicenseRecord[]> {
  return delay([...mockLicenses].sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)));
}

/* --------------------------------------------------------- notifications */

export async function getNotifications(): Promise<AccountNotification[]> {
  const state = load();
  const read = new Set(state.readNotificationIds ?? []);
  const hidden = new Set(state.hiddenNotificationIds ?? []);
  return delay(
    mockNotifications
      .filter((n) => !hidden.has(n.id))
      .map((n) => ({ ...n, read: n.read || read.has(n.id) }))
      .sort((a, b) => b.at.localeCompare(a.at)),
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  const state = load();
  const ids = new Set(state.readNotificationIds ?? []);
  ids.add(id);
  save({ ...state, readNotificationIds: [...ids] });
  await delay(null);
}

export async function markAllNotificationsRead(): Promise<void> {
  const state = load();
  save({ ...state, readNotificationIds: mockNotifications.map((n) => n.id) });
  await delay(null);
}

export async function dismissNotification(id: string): Promise<void> {
  const state = load();
  const ids = new Set(state.hiddenNotificationIds ?? []);
  ids.add(id);
  save({ ...state, hiddenNotificationIds: [...ids] });
  await delay(null);
}

/* --------------------------------------------------------------- support */

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const state = load();
  return delay(
    [...(state.tickets ?? []), ...mockTickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function createSupportTicket(input: {
  category: TicketCategory;
  subject: string;
  message: string;
  productId?: string;
  orderId?: string;
}): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: `t-local-${Date.now()}`,
    reference: `SUP-${5000 + Math.floor(Math.random() * 900)}`,
    category: input.category,
    subject: input.subject,
    message: input.message,
    status: "open",
    createdAt: new Date().toISOString(),
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.orderId ? { orderId: input.orderId } : {}),
  };
  const state = load();
  save({ ...state, tickets: [ticket, ...(state.tickets ?? [])].slice(0, 20) });
  await delay(null);
  return ticket;
}

/* ------------------------------------------------------------- discovery */

export const getRecentlyViewedSlugs = () => mockRecentlyViewedSlugs;

/* --------------------------------------------------------------- helpers */

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  return rtf.format(-Math.round(days / 30), "month");
};
