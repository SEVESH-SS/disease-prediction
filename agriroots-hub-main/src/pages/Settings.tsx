import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, Globe, MessageCircle, Shield, User, 
  ChevronRight, Moon, Sun, Smartphone, Mail,
  LogOut, HelpCircle, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    title: "Account",
    items: [
      { 
        icon: User, 
        label: "Profile Settings", 
        description: "Update your farm & personal details",
        action: "navigate"
      },
      { 
        icon: Shield, 
        label: "Privacy & Security", 
        description: "Manage passwords & data sharing",
        action: "navigate"
      },
      { 
        icon: Mail, 
        label: "Email Notifications", 
        description: "Weekly reports & alerts",
        action: "toggle",
        enabled: true
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      { 
        icon: Globe, 
        label: "Language", 
        description: "English",
        action: "select",
        options: ["English", "தமிழ்", "हिंदी"]
      },
      { 
        icon: Bell, 
        label: "Push Notifications", 
        description: "Pest alerts, weather & prices",
        action: "toggle",
        enabled: true
      },
      { 
        icon: MessageCircle, 
        label: "Telegram Sync", 
        description: "Send alerts to Telegram",
        action: "toggle",
        enabled: false
      },
      { 
        icon: Smartphone, 
        label: "SMS Alerts", 
        description: "Critical alerts via SMS",
        action: "toggle",
        enabled: true
      },
    ],
  },
  {
    title: "Support",
    items: [
      { 
        icon: HelpCircle, 
        label: "Help Center", 
        description: "FAQs & tutorials",
        action: "navigate"
      },
      { 
        icon: FileText, 
        label: "Terms & Privacy", 
        description: "Legal information",
        action: "navigate"
      },
    ],
  },
];

const Settings = () => {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    "Email Notifications": true,
    "Push Notifications": true,
    "Telegram Sync": false,
    "SMS Alerts": true,
  });

  const handleToggle = (label: string) => {
    setToggleStates(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your app preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-primary to-terra-forest-light rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-2xl font-bold text-accent-foreground">
            VK
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Vijay Kumar</h2>
            <p className="text-primary-foreground/80">vijay.kumar@email.com</p>
            <p className="text-sm text-primary-foreground/60 mt-1">5 Acres • Coimbatore, TN</p>
          </div>
          <Button variant="glass" size="sm" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0">
            Edit
          </Button>
        </div>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {section.title}
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento">
            {section.items.map((item, index) => (
              <motion.div
                key={item.label}
                whileHover={{ backgroundColor: "hsl(var(--muted) / 0.3)" }}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  index !== section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                
                {item.action === "toggle" && (
                  <button
                    onClick={() => handleToggle(item.label)}
                    className={`w-12 h-7 rounded-full relative transition-colors ${
                      toggleStates[item.label] ? "bg-accent" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      animate={{ x: toggleStates[item.label] ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 bg-card rounded-full shadow"
                    />
                  </button>
                )}
                
                {item.action === "navigate" && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                
                {item.action === "select" && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" size="touch">
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </motion.div>

      {/* Version Info */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        TerraNova v1.0.0 • Made with 💚 for Indian Farmers
      </p>
    </motion.div>
  );
};

export default Settings;
