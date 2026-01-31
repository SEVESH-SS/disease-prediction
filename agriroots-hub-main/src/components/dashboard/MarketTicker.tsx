import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

const marketData = [
  { crop: "Tomato", price: 40, unit: "kg", change: 5, trending: "up" },
  { crop: "Onion", price: 28, unit: "kg", change: -3, trending: "down" },
  { crop: "Potato", price: 22, unit: "kg", change: 2, trending: "up" },
  { crop: "Rice", price: 45, unit: "kg", change: 0, trending: "up" },
  { crop: "Wheat", price: 32, unit: "kg", change: 1, trending: "up" },
  { crop: "Cotton", price: 6200, unit: "quintal", change: 150, trending: "up" },
  { crop: "Sugarcane", price: 3100, unit: "ton", change: -50, trending: "down" },
  { crop: "Groundnut", price: 5800, unit: "quintal", change: 80, trending: "up" },
];

export function MarketTicker() {
  const tickerItems = [...marketData, ...marketData]; // Duplicate for seamless loop

  return (
    <div className="overflow-hidden py-2 px-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {tickerItems.map((item, index) => (
          <div key={`${item.crop}-${index}`} className="flex items-center gap-2">
            <span className="font-medium">{item.crop}</span>
            <span className="text-primary-foreground/80">
              ₹{item.price}/{item.unit}
            </span>
            <span
              className={`flex items-center text-xs ${
                item.trending === "up" ? "text-terra-neon" : "text-red-400"
              }`}
            >
              {item.trending === "up" ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {item.change > 0 ? "+" : ""}
              {item.change}
            </span>
            <span className="text-primary-foreground/30 ml-4">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
