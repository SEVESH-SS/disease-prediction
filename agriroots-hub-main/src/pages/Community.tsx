import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MapPin, Play, FileText, ChevronRight, 
  Check, ExternalLink, Heart, MessageCircle, Share2,
  Award, Sprout
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "farmers", label: "Nearby Farmers", icon: MapPin },
  { id: "shorts", label: "Agri Shorts", icon: Play },
  { id: "schemes", label: "Govt Schemes", icon: FileText },
];

const nearbyFarmers = [
  { id: 1, name: "Murugan", distance: "0.5 km", crops: ["Cotton", "Maize"], experience: "15 yrs", avatar: "🧑‍🌾" },
  { id: 2, name: "Lakshmi", distance: "1.2 km", crops: ["Tomato", "Chilli"], experience: "8 yrs", avatar: "👩‍🌾" },
  { id: 3, name: "Senthil", distance: "2 km", crops: ["Groundnut"], experience: "20 yrs", avatar: "👨‍🌾" },
  { id: 4, name: "Priya", distance: "2.5 km", crops: ["Organic Vegetables"], experience: "5 yrs", avatar: "👩‍🌾" },
  { id: 5, name: "Kumar", distance: "3 km", crops: ["Sugarcane", "Paddy"], experience: "25 yrs", avatar: "🧑‍🌾" },
];

const agriShorts = [
  {
    id: 1,
    title: "Organic Pest Control Tips",
    author: "Dr. Agri Expert",
    views: "12.5K",
    likes: "1.2K",
    thumbnail: "🌿",
    duration: "0:45",
    language: "Tamil",
  },
  {
    id: 2,
    title: "Drip Irrigation Setup Guide",
    author: "Farmer's Channel",
    views: "8.3K",
    likes: "890",
    thumbnail: "💧",
    duration: "1:20",
    language: "Tamil",
  },
  {
    id: 3,
    title: "Cotton Harvesting Best Practices",
    author: "Agri University",
    views: "5.7K",
    likes: "456",
    thumbnail: "🌾",
    duration: "2:00",
    language: "English",
  },
  {
    id: 4,
    title: "Soil Testing at Home",
    author: "Green Thumb",
    views: "15K",
    likes: "2.1K",
    thumbnail: "🧪",
    duration: "1:45",
    language: "Hindi",
  },
];

const govtSchemes = [
  {
    id: 1,
    name: "PM-KISAN",
    description: "Direct income support of ₹6,000/year to farmer families",
    status: "eligible",
    deadline: "Feb 15, 2024",
    amount: "₹6,000/year",
  },
  {
    id: 2,
    name: "Crop Insurance (PMFBY)",
    description: "Protection against crop loss due to natural calamities",
    status: "applied",
    deadline: "Mar 31, 2024",
    amount: "Premium subsidy",
  },
  {
    id: 3,
    name: "Kisan Credit Card",
    description: "Easy credit for agricultural needs at subsidized rates",
    status: "eligible",
    deadline: "Open",
    amount: "Up to ₹3 Lakh",
  },
  {
    id: 4,
    name: "Soil Health Card",
    description: "Free soil testing and nutrient recommendations",
    status: "completed",
    deadline: "Open",
    amount: "Free",
  },
];

const Community = () => {
  const [activeTab, setActiveTab] = useState("farmers");

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          Community Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect, learn, and grow with fellow farmers
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Nearby Farmers */}
        {activeTab === "farmers" && (
          <motion.div
            key="farmers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Map Placeholder */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento h-[400px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-terra-info/10">
                {/* Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }}
                />

                {/* Farmer Pins */}
                {nearbyFarmers.map((farmer, index) => (
                  <motion.div
                    key={farmer.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    className="absolute"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-12 h-12 bg-card rounded-full border-2 border-accent shadow-lg flex items-center justify-center text-xl cursor-pointer"
                    >
                      {farmer.avatar}
                    </motion.div>
                  </motion.div>
                ))}

                {/* Center - You */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-2xl border-4 border-card shadow-neon">
                      📍
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-accent rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3">
                <p className="text-sm font-medium">5 farmers nearby</p>
                <p className="text-xs text-muted-foreground">Tap on a pin to view profile</p>
              </div>
            </div>

            {/* Farmers List */}
            <div className="space-y-3">
              {nearbyFarmers.map((farmer, index) => (
                <motion.div
                  key={farmer.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-bento cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                      {farmer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{farmer.name}</h3>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {farmer.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="w-3 h-3 text-terra-warning" />
                        <span className="text-xs text-muted-foreground">{farmer.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {farmer.crops.map((crop) => (
                          <span key={crop} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Agri Shorts */}
        {activeTab === "shorts" && (
          <motion.div
            key="shorts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {agriShorts.map((short, index) => (
              <motion.div
                key={short.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 lg:h-56 bg-gradient-to-br from-primary to-terra-forest-light flex items-center justify-center">
                  <span className="text-6xl">{short.thumbnail}</span>
                  
                  {/* Play Button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-foreground/20"
                  >
                    <div className="w-14 h-14 rounded-full bg-card/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground ml-1" />
                    </div>
                  </motion.div>

                  {/* Duration */}
                  <span className="absolute bottom-2 right-2 bg-foreground/80 text-background text-xs px-2 py-0.5 rounded">
                    {short.duration}
                  </span>

                  {/* Language */}
                  <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                    {short.language}
                  </span>
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{short.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{short.author}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{short.views} views</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {short.likes}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Govt Schemes */}
        {activeTab === "schemes" && (
          <motion.div
            key="schemes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {govtSchemes.map((scheme, index) => (
              <motion.div
                key={scheme.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl border border-border p-5 shadow-bento"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{scheme.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        scheme.status === "eligible" 
                          ? "bg-accent/10 text-accent"
                          : scheme.status === "applied"
                          ? "bg-terra-warning/10 text-terra-warning"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {scheme.status === "eligible" && "Eligible"}
                        {scheme.status === "applied" && "Applied"}
                        {scheme.status === "completed" && "Completed ✓"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Sprout className="w-4 h-4" />
                        {scheme.amount}
                      </span>
                      <span className="text-muted-foreground">
                        Deadline: {scheme.deadline}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {scheme.status === "eligible" && (
                      <Button variant="accent" size="touch">
                        <Check className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    )}
                    {scheme.status === "applied" && (
                      <Button variant="outline" size="touch">
                        Track Status
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-accent/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-accent">3</p>
                <p className="text-sm text-muted-foreground">Eligible Schemes</p>
              </div>
              <div className="bg-terra-warning/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold text-terra-warning">1</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
              <div className="bg-primary/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">₹24K</p>
                <p className="text-sm text-muted-foreground">Benefits Received</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
