import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  amount: number;
  trips: number;
  icon: LucideIcon;
  gradient?: boolean;
}

export default function MetricCard({ title, amount, trips, icon: Icon, gradient }: MetricCardProps) {
  return (
    <div className={`rounded-xl p-6 ${gradient ? 'gradient-primary text-primary-foreground' : 'glass-card'}`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gradient ? 'bg-primary-foreground/20' : 'bg-accent'}`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-primary-foreground' : 'text-accent-foreground'}`} />
        </div>
      </div>
      <p className={`text-2xl font-heading font-bold ${gradient ? '' : 'text-foreground'}`}>₹{amount.toLocaleString()}</p>
      <p className={`text-sm mt-1 ${gradient ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{trips} trips</p>
    </div>
  );
}
