import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SmartAlerts } from "@/components/dashboard/SmartAlerts";
import { CropStatusCard } from "@/components/dashboard/CropStatusCard";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Good Morning, Vijay! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening on your farm today
          </p>
        </div>
        <div className="hidden lg:block text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-semibold">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Weather - Takes 2 columns */}
        <WeatherCard />

        {/* Quick Actions - Takes 2 columns */}
        <QuickActions />

        {/* Crop Status - Takes 2 columns */}
        <CropStatusCard />

        {/* Smart Alerts - Takes 2 columns */}
        <SmartAlerts />
      </div>
    </div>
  );
};

export default Index;
