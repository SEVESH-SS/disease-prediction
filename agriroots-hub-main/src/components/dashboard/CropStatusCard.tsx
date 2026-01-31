import { motion } from "framer-motion";
import { Sprout, TrendingUp, Calendar, Droplets } from "lucide-react";

const cropData = [
  { name: "Cotton", stage: "Flowering", progress: 65, daysLeft: 45, health: "Good" },
  { name: "Tomato", stage: "Fruiting", progress: 80, daysLeft: 20, health: "Excellent" },
];

export function CropStatusCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="col-span-1 lg:col-span-2 bg-card rounded-2xl p-6 shadow-bento border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Active Crops</h2>
            <p className="text-sm text-muted-foreground">2 crops in field</p>
          </div>
        </div>
        <button className="text-sm text-accent font-medium hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {cropData.map((crop, index) => (
          <motion.div
            key={crop.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-secondary/50 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{crop.name}</h3>
                <p className="text-sm text-muted-foreground">{crop.stage}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                crop.health === "Excellent" 
                  ? "bg-accent/10 text-accent" 
                  : "bg-terra-warning/10 text-terra-warning"
              }`}>
                {crop.health}
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${crop.progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-accent to-terra-neon-glow rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{crop.daysLeft} days to harvest</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-accent" />
                <span>{crop.progress}% complete</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
