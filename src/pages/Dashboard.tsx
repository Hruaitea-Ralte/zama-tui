import { useMemo } from "react";
import { Droplets, CalendarDays, CalendarRange } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { getTodaySales, getWeekSales, getMonthSales, getSalesMetrics } from "@/lib/store";

export default function Dashboard() {
  const todayMetrics = useMemo(() => getSalesMetrics(getTodaySales()), []);
  const weekMetrics = useMemo(() => getSalesMetrics(getWeekSales()), []);
  const monthMetrics = useMemo(() => getSalesMetrics(getMonthSales()), []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back 👋</h1>
        <p className="text-muted-foreground mt-1">Here's your delivery overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <MetricCard title="Today's Sales" amount={todayMetrics.totalAmount} trips={todayMetrics.totalTrips} icon={Droplets} gradient />
        <MetricCard title="This Week" amount={weekMetrics.totalAmount} trips={weekMetrics.totalTrips} icon={CalendarDays} />
        <MetricCard title="This Month" amount={monthMetrics.totalAmount} trips={monthMetrics.totalTrips} icon={CalendarRange} />
      </div>
    </div>
  );
}