import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { effectivePrice, validateCoupon } from "@/lib/catalog/service";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";
import { licenseById } from "@/lib/catalog/licenses";
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
  discountMessage: string | null;
  total: number;
  wishlist: string[];
  wishlistCount: number;
  addToCart: (productId: string, license?: LicenseId) => { added: boolean };
  removeFromCart: (productId: string, license: LicenseId) => void;
  setLicense: (productId: string, from: LicenseId, to: LicenseId) => void;
  setQuantity: (productId: string, license: LicenseId, quantity: number) => void;
  toggleSaveForLater: (productId: string, license: LicenseId) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeDiscount: () => void;
  toggleWishlist: (productId: string) => boolean;
  isWishlisted: (productId: string) => boolean;
  hydrated: boolean;
  cartLoading: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function buildLine(item: CartItem, productsById: Map<string, Product>): CartLine | null {
  const product = productsById.get(item.productId);
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
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const productIds = useMemo(() => cart.map((item) => item.productId), [cart]);
  const { productsById, isLoading: cartLoading } = useProductsByIds(productIds);

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

  const removeDiscount = useCallback(() => {
    setDiscountCode(null);
    setDiscountPercent(0);
    setDiscountMessage(null);
  }, []);

  const applyDiscount = useCallback(
    async (code: string) => {
      const key = code.trim();
      if (!key) return { ok: false, message: "Enter a discount code." };

      const activeLines = cart
        .map((item) => buildLine(item, productsById))
        .filter((line): line is CartLine => line !== null && !line.savedForLater);
      const subtotal = activeLines.reduce((sum, line) => sum + line.lineTotal, 0);

      try {
        const result = await validateCoupon(key, subtotal);
        setDiscountCode(result.code);
        setDiscountPercent(result.percent);
        setDiscountMessage(result.message);
        return { ok: true, message: result.message };
      } catch {
        removeDiscount();
        return { ok: false, message: `"${key.toUpperCase()}" is not a valid code.` };
      }
    },
    [cart, productsById, removeDiscount],
  );

  const toggleWishlist = useCallback((productId: string) => {
    let nowSaved = false;
    setWishlist((prev) => {
      nowSaved = !prev.includes(productId);
      return nowSaved ? [...prev, productId] : prev.filter((id) => id !== productId);
    });
    return nowSaved;
  }, []);

  const value = useMemo<StoreValue>(() => {
    const all = cart
      .map((item) => buildLine(item, productsById))
      .filter((line): line is CartLine => line !== null);
    const lines = all.filter((line) => !line.savedForLater);
    const savedLines = all.filter((line) => line.savedForLater);
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const discount = Math.round((subtotal * discountPercent) / 100);

    return {
      cart,
      lines,
      savedLines,
      count: lines.reduce((n, line) => n + line.quantity, 0),
      subtotal,
      discount,
      discountCode,
      discountMessage,
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
      cartLoading,
    };
  }, [
    cart,
    wishlist,
    discountCode,
    discountPercent,
    discountMessage,
    hydrated,
    cartLoading,
    productsById,
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
