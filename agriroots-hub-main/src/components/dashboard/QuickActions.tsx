import { motion } from "framer-motion";
import { Scan, Tractor, Users, Mic } from "lucide-react";
import { Link } from "react-router-dom";

const quickActions = [
  {
    icon: Scan,
    label: "Scan Crop",
    description: "AI disease detection",
    to: "/crop-doctor",
    gradient: "from-accent to-terra-neon-glow",
    iconBg: "bg-accent/20",
  },
  {
    icon: Tractor,
    label: "Rent Machinery",
    description: "Tractors & drones",
    to: "/marketplace",
    gradient: "from-terra-warning to-orange-400",
    iconBg: "bg-terra-warning/20",
  },
  {
    icon: Users,
    label: "My Buyers",
    description: "Direct connections",
    to: "/marketplace",
    gradient: "from-terra-info to-blue-400",
    iconBg: "bg-terra-info/20",
  },
  {
    icon: Mic,
    label: "Voice Assistant",
    description: "Ask in Tamil/English",
    to: "#",
    gradient: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/20",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function QuickActions() {
  return (
    <div className="col-span-1 lg:col-span-2">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {quickActions.map((action) => (
          <motion.div key={action.label} variants={item}>
            <Link to={action.to}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${action.gradient} text-primary-foreground min-h-[120px] shadow-bento`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold">{action.label}</p>
                <p className="text-xs text-primary-foreground/80 mt-0.5">{action.description}</p>
                
                {/* Decorative circle */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
