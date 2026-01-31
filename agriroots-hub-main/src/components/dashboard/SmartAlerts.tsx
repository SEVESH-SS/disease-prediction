import { motion } from "framer-motion";
import { AlertTriangle, FileCheck, Info, X } from "lucide-react";
import { useState } from "react";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  time: string;
}

const initialAlerts: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Pest Alert",
    message: "Fall Armyworm detected in 5km radius. Take preventive measures.",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "info",
    title: "Govt Subsidy",
    message: "PM-Kisan verification due by Feb 15. Complete e-KYC now.",
    time: "1 day ago",
  },
  {
    id: "3",
    type: "success",
    title: "Market Update",
    message: "Cotton prices up 15% this week. Good time to sell.",
    time: "3 hours ago",
  },
];

const alertStyles = {
  warning: {
    bg: "bg-terra-warning/10",
    border: "border-terra-warning/30",
    icon: AlertTriangle,
    iconColor: "text-terra-warning",
  },
  info: {
    bg: "bg-terra-info/10",
    border: "border-terra-info/30",
    icon: Info,
    iconColor: "text-terra-info",
  },
  success: {
    bg: "bg-accent/10",
    border: "border-accent/30",
    icon: FileCheck,
    iconColor: "text-accent",
  },
};

export function SmartAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Smart Alerts</h2>
        <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full font-medium">
          {alerts.length} New
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`${style.bg} ${style.border} border rounded-xl p-4 relative group`}
            >
              <button
                onClick={() => dismissAlert(alert.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-foreground/10 rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${style.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>All caught up! No new alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
