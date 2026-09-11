import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { adminCustomersQuery } from "./queries";
import type { AdminCustomer } from "./types";

export function useAdminCustomerMap() {
  const { data } = useQuery(adminCustomersQuery());

  return useMemo(() => {
    const map = new Map<string, AdminCustomer>();
    for (const customer of data ?? []) {
      map.set(customer.id, customer);
    }
    return map;
  }, [data]);
}

export function useAdminCustomerName(customerId: string) {
  const map = useAdminCustomerMap();
  return map.get(customerId)?.name ?? customerId;
}
