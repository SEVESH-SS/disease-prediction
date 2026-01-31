import { motion } from "framer-motion";
import { Cloud, Sun, Droplets, Wind, Thermometer } from "lucide-react";

export function WeatherCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="col-span-1 lg:col-span-2 bg-gradient-to-br from-terra-info to-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden shadow-bento"
    >
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 opacity-20">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Cloud className="w-32 h-32 text-primary-foreground/30" />
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium">Coimbatore, TN</p>
            <p className="text-5xl font-bold mt-1">28°C</p>
            <p className="text-primary-foreground/80 mt-1">Partly Cloudy</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sun className="w-16 h-16 text-yellow-300" />
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">Humidity</p>
              <p className="font-semibold">65%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">Wind</p>
              <p className="font-semibold">12 km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary-foreground/70" />
            <div>
              <p className="text-xs text-primary-foreground/60">Feels like</p>
              <p className="font-semibold">31°C</p>
            </div>
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="mt-6 p-4 bg-background/10 backdrop-blur rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Soil Moisture</p>
            <span className="text-accent font-bold">72%</span>
          </div>
          <div className="h-2 bg-background/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <p className="text-xs text-primary-foreground/60 mt-2">Optimal for current crop stage</p>
        </div>
      </div>
    </motion.div>
  );
}
