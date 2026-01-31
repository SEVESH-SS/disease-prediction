import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "₹2,45,000", change: "+12%", positive: true },
  { label: "Active Contracts", value: "8", change: "+2", positive: true },
  { label: "Field Health", value: "92%", change: "+5%", positive: true },
];

export function StatsOverview() {
  return (
    <div className="col-span-1 lg:col-span-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-card rounded-2xl p-5 shadow-bento border border-border"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.positive 
                  ? "bg-accent/10 text-accent" 
                  : "bg-destructive/10 text-destructive"
              }`}>
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
