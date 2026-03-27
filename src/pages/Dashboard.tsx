import { useMemo } from "react";
import { Droplets, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "@/components/MetricCard";
import { getTodaySales, getWeekSales, getMonthSales, getSalesMetrics, getWeeklyChartData } from "@/lib/store";

export default function Dashboard() {
  const todayMetrics = useMemo(() => getSalesMetrics(getTodaySales()), []);
  const weekMetrics = useMemo(() => getSalesMetrics(getWeekSales()), []);
  const monthMetrics = useMemo(() => getSalesMetrics(getMonthSales()), []);
  const chartData = useMemo(() => getWeeklyChartData(), []);

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

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">Sales Trend (Last 7 Days)</h3>
        </div>
        {chartData.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Amount (₹)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Droplets className="w-12 h-12 mb-3 text-primary/30" />
            <p>No sales data yet. Start logging deliveries!</p>
          </div>
        )}
      </div>
    </div>
  );
}
