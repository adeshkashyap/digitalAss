import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { effectivePrice } from "@/lib/catalog/service";
import { licenseById } from "@/lib/catalog/licenses";
import { productById } from "@/lib/catalog/products";
import type { CartItem, LicenseId, Product } from "@/lib/catalog/types";

const CART_KEY = "devassets.cart.v1";
const WISHLIST_KEY = "devassets.wishlist.v1";

export interface CartLine extends CartItem {
  product: Product;
  unitPrice: number;
  lineTotal: number;
  licenseName: string;
}

interface StoreValue {
  cart: CartItem[];
  lines: CartLine[];
  savedLines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  discountCode: string | null;
  total: number;
  wishlist: string[];
  wishlistCount: number;
  addToCart: (productId: string, license?: LicenseId) => { added: boolean };
  removeFromCart: (productId: string, license: LicenseId) => void;
  setLicense: (productId: string, from: LicenseId, to: LicenseId) => void;
  setQuantity: (productId: string, license: LicenseId, quantity: number) => void;
  toggleSaveForLater: (productId: string, license: LicenseId) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => { ok: boolean; message: string };
  removeDiscount: () => void;
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  hydrated: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

/** Mock promotion codes — replaced by a pricing endpoint later. */
const CODES: Record<string, { percent: number; label: string }> = {
  SHIP20: { percent: 20, label: "SHIP20 — 20% off" },
  LAUNCH10: { percent: 10, label: "LAUNCH10 — 10% off" },
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartItem[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((productId: string, license: LicenseId = "commercial") => {
    let added = true;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.license === license);
      if (existing) {
        added = false;
        return prev.map((i) => (i === existing ? { ...i, savedForLater: false } : i));
      }
      return [...prev, { productId, license, quantity: 1 }];
    });
    return { added };
  }, []);

  const removeFromCart = useCallback((productId: string, license: LicenseId) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.license === license)));
  }, []);

  const setLicense = useCallback((productId: string, from: LicenseId, to: LicenseId) => {
    setCart((prev) => {
      const withoutTarget = prev.filter((i) => !(i.productId === productId && i.license === to));
      return withoutTarget.map((i) =>
        i.productId === productId && i.license === from ? { ...i, license: to } : i,
      );
    });
  }, []);

  const setQuantity = useCallback((productId: string, license: LicenseId, quantity: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.license === license
          ? { ...i, quantity: Math.min(10, Math.max(1, quantity)) }
          : i,
      ),
    );
  }, []);

  const toggleSaveForLater = useCallback((productId: string, license: LicenseId) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.license === license
          ? { ...i, savedForLater: !i.savedForLater }
          : i,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const applyDiscount = useCallback((code: string) => {
    const key = code.trim().toUpperCase();
    if (!key) return { ok: false, message: "Enter a discount code." };
    if (!CODES[key]) return { ok: false, message: `"${key}" is not a valid code.` };
    setDiscountCode(key);
    return { ok: true, message: `${CODES[key].label} applied.` };
  }, []);

  const removeDiscount = useCallback(() => setDiscountCode(null), []);

  const toggleWishlist = useCallback((productId: string) => {
    let nowSaved = false;
    setWishlist((prev) => {
      nowSaved = !prev.includes(productId);
      return nowSaved ? [...prev, productId] : prev.filter((id) => id !== productId);
    });
    return nowSaved;
  }, []);

  const value = useMemo<StoreValue>(() => {
    const toLine = (item: CartItem): CartLine | null => {
      const product = productById(item.productId);
      if (!product) return null;
      const license = licenseById(item.license);
      const unitPrice = Math.round(effectivePrice(product) * license.multiplier);
      return {
        ...item,
        product,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
        licenseName: license.name,
      };
    };

    const all = cart.map(toLine).filter((l): l is CartLine => l !== null);
    const lines = all.filter((l) => !l.savedForLater);
    const savedLines = all.filter((l) => l.savedForLater);
    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const percent = discountCode ? (CODES[discountCode]?.percent ?? 0) : 0;
    const discount = Math.round((subtotal * percent) / 100);

    return {
      cart,
      lines,
      savedLines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      discount,
      discountCode,
      total: Math.max(0, subtotal - discount),
      wishlist,
      wishlistCount: wishlist.length,
      addToCart,
      removeFromCart,
      setLicense,
      setQuantity,
      toggleSaveForLater,
      clearCart,
      applyDiscount,
      removeDiscount,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      hydrated,
    };
  }, [
    cart,
    wishlist,
    discountCode,
    hydrated,
    addToCart,
    removeFromCart,
    setLicense,
    setQuantity,
    toggleSaveForLater,
    clearCart,
    applyDiscount,
    removeDiscount,
    toggleWishlist,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
