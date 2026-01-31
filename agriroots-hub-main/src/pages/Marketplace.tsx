import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Tractor, Package, Plus, X, Check, 
  MapPin, Star, Clock, ChevronLeft, ChevronRight, Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "sell", label: "Sell Crops", icon: Package },
  { id: "rent", label: "Rent Machinery", icon: Tractor },
];

const machinery = [
  {
    id: 1,
    name: "John Deere 5050D",
    type: "Tractor",
    rate: "₹800/hr",
    rating: 4.8,
    reviews: 124,
    distance: "2.5 km",
    available: true,
    image: "🚜",
    owner: "Rajan Farm Services",
  },
  {
    id: 2,
    name: "DJI Agras T30",
    type: "Drone Sprayer",
    rate: "₹1,200/hr",
    rating: 4.9,
    reviews: 56,
    distance: "5 km",
    available: true,
    image: "🛸",
    owner: "AgriTech Solutions",
  },
  {
    id: 3,
    name: "Mahindra Harvester",
    type: "Combine Harvester",
    rate: "₹2,500/hr",
    rating: 4.7,
    reviews: 89,
    distance: "8 km",
    available: false,
    image: "🌾",
    owner: "Kumar Agro",
  },
  {
    id: 4,
    name: "Rotavator 6ft",
    type: "Tillage Equipment",
    rate: "₹500/hr",
    rating: 4.5,
    reviews: 203,
    distance: "1 km",
    available: true,
    image: "⚙️",
    owner: "Village Equipment Hub",
  },
];

const buyers = [
  {
    id: 1,
    name: "Fresh Mart Wholesale",
    crop: "Tomato",
    quantity: "500 kg",
    price: "₹42/kg",
    distance: "15 km",
    rating: 4.6,
    verified: true,
  },
  {
    id: 2,
    name: "Coimbatore Traders",
    crop: "Cotton",
    quantity: "2 tons",
    price: "₹6,400/quintal",
    distance: "25 km",
    rating: 4.8,
    verified: true,
  },
  {
    id: 3,
    name: "Organic Foods Ltd",
    crop: "Groundnut",
    quantity: "1 ton",
    price: "₹5,900/quintal",
    distance: "30 km",
    rating: 4.4,
    verified: false,
  },
];

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("sell");
  const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);

  const nextBuyer = () => {
    setCurrentBuyerIndex((prev) => (prev + 1) % buyers.length);
  };

  const prevBuyer = () => {
    setCurrentBuyerIndex((prev) => (prev - 1 + buyers.length) % buyers.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-accent" />
          </div>
          Marketplace
        </h1>
        <p className="text-muted-foreground mt-2">
          Buy, sell crops & rent equipment from nearby farmers
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-card rounded-xl p-1 border border-border w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "sell" ? (
          <motion.div
            key="sell"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Sell Form */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-bento">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                List Your Crop
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Crop Type</label>
                  <select className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground">
                    <option>Tomato</option>
                    <option>Cotton</option>
                    <option>Groundnut</option>
                    <option>Onion</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <input 
                      type="number" 
                      placeholder="500"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Unit</label>
                    <select className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground">
                      <option>kg</option>
                      <option>quintal</option>
                      <option>ton</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <input 
                      type="number" 
                      placeholder="40"
                      className="w-full h-12 pl-8 pr-16 rounded-xl border border-border bg-background"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">/kg</span>
                  </div>
                </div>

                {/* Auto Price Suggestion */}
                <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Market Rate</p>
                      <p className="text-xs text-muted-foreground">Based on current trends</p>
                    </div>
                    <span className="text-xl font-bold text-accent">₹38-42/kg</span>
                  </div>
                </div>

                <Button variant="accent" size="touch" className="w-full">
                  <Package className="w-5 h-5 mr-2" />
                  List for Sale
                </Button>
              </div>
            </div>

            {/* Buyer Match - Tinder Style */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Buyer Matches
                </h2>
                <p className="text-sm text-muted-foreground">Wholesalers looking for your crops</p>
              </div>

              <div className="relative h-[350px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBuyerIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-4 bg-gradient-to-br from-primary to-terra-forest-light rounded-2xl p-6 text-primary-foreground flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {buyers[currentBuyerIndex].verified && (
                          <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full mb-2">
                            <Check className="w-3 h-3" /> Verified
                          </span>
                        )}
                        <h3 className="text-xl font-bold">{buyers[currentBuyerIndex].name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-primary-foreground/80">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{buyers[currentBuyerIndex].distance}</span>
                          <Star className="w-4 h-4 ml-2" />
                          <span className="text-sm">{buyers[currentBuyerIndex].rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="bg-primary-foreground/10 rounded-xl p-4">
                        <p className="text-sm text-primary-foreground/70">Looking for</p>
                        <p className="text-2xl font-bold">{buyers[currentBuyerIndex].crop}</p>
                        <p className="text-sm">{buyers[currentBuyerIndex].quantity}</p>
                      </div>
                      
                      <div className="bg-accent/20 rounded-xl p-4">
                        <p className="text-sm text-primary-foreground/70">Offering Price</p>
                        <p className="text-3xl font-bold">{buyers[currentBuyerIndex].price}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Button 
                        variant="glass" 
                        size="touch" 
                        className="flex-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
                        onClick={prevBuyer}
                      >
                        <X className="w-5 h-5 mr-2" />
                        Pass
                      </Button>
                      <Button 
                        variant="glass" 
                        size="touch" 
                        className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground border-0"
                        onClick={nextBuyer}
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {buyers.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentBuyerIndex ? "bg-accent w-4" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Machinery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {machinery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento group"
                >
                  {/* Image Area */}
                  <div className="h-32 bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-5xl relative">
                    {item.image}
                    {/* Availability Badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      item.available 
                        ? "bg-accent/10 text-accent" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${item.available ? "bg-accent" : "bg-muted-foreground"}`} />
                      {item.available ? "Available" : "Booked"}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{item.owner}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-terra-warning" />
                        {item.rating} ({item.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.distance}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">{item.rate}</span>
                      <Button 
                        variant={item.available ? "accent" : "outline"} 
                        size="sm"
                        disabled={!item.available}
                      >
                        {item.available ? "Book Now" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
