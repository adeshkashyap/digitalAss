import { ClientOnly } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDay, formatMoney, formatNumber } from "@/lib/admin/service";
import type { SeriesPoint } from "@/lib/admin/types";

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

function ChartFrame({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <ClientOnly fallback={<Skeleton style={{ height }} className="w-full" />}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </ClientOnly>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
} as const;

export function RevenueAreaChart({
  series,
  height = 260,
}: {
  series: SeriesPoint[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDay} {...axis} minTickGap={24} />
        <YAxis tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} width={44} {...axis} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [formatMoney(Number(value)), "Revenue"]}
          labelFormatter={(label: string) => formatDay(label)}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-brand)"
          strokeWidth={2}
          fill="url(#revenueFill)"
        />
      </AreaChart>
    </ChartFrame>
  );
}

export function OrdersLineChart({
  series,
  height = 220,
}: {
  series: SeriesPoint[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatDay} {...axis} minTickGap={24} />
        <YAxis width={32} {...axis} />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [formatNumber(Number(value)), "Orders"]}
          labelFormatter={(label: string) => formatDay(label)}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="var(--color-cyan)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartFrame>
  );
}

export function CategoryBarChart({
  data,
  height = 260,
}: {
  data: { name: string; revenue: number }[];
  height?: number;
}) {
  const palette = ["var(--color-brand)", "var(--color-cyan)", "var(--color-violet)"];
  return (
    <ChartFrame height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} {...axis} />
        <YAxis type="category" dataKey="name" width={128} {...axis} />
        <Tooltip {...tooltipStyle} formatter={(value) => [formatMoney(Number(value)), "Revenue"]} />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={palette[i % palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
