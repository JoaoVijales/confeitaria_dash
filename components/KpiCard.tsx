'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";
import CountUp from "react-countup";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
  gradient: string;
}

export function KpiCard({ title, value, icon, trend, prefix, suffix, gradient }: KpiCardProps) {
  const TrendIcon = trend && trend >= 0 ? ArrowUp : ArrowDown;
  const trendColor = trend && trend >= 0 ? "text-green-500" : "text-red-500";

  return (
    <Card className={`rounded-xl border border-slate-200 shadow-sm ${gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className="[&>svg]:h-6 [&>svg]:w-6 text-slate-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">
          {typeof value === 'number' ? (
            <CountUp
              end={value}
              duration={1.2}
              preserveValue
              separator="."
              decimal=","
              prefix={prefix}
              suffix={suffix}
            />
          ) : (
            value
          )}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`flex items-center gap-1 ${trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span>{trend.toFixed(1)}%</span>
            </Badge>
            <span className="text-xs text-slate-500">vs semana anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
