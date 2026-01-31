import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Scan,
  Map,
  ShoppingCart,
  Users,
  Settings,
  Leaf,
  Globe,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/crop-doctor", icon: Scan, label: "Crop Doctor" },
  { to: "/planner", icon: Map, label: "Smart Planner" },
  { to: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const languages = ["EN", "தமிழ்", "हिं"];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Leaf className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">TerraNova</h1>
            <p className="text-xs text-sidebar-foreground/60">Agritech Ecosystem</p>
          </div>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2 bg-sidebar-accent/30 rounded-lg p-1">
          <Globe className="w-4 h-4 ml-2 text-sidebar-foreground/60" />
          {languages.map((lang, i) => (
            <button
              key={lang}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                i === 0 
                  ? "bg-accent text-accent-foreground" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-accent" : ""}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 rounded-full bg-accent"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/30">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
            VK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Vijay Kumar</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">5 Acres • Coimbatore</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
