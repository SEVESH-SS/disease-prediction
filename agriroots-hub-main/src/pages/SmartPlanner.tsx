import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, Layers, Droplets, Leaf, Lightbulb, ChevronRight, Sun, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";

const overlayOptions = [
  { id: "moisture", label: "Soil Moisture", icon: Droplets, color: "bg-terra-info" },
  { id: "ndvi", label: "NDVI Health", icon: Leaf, color: "bg-accent" },
  { id: "temperature", label: "Temperature", icon: Sun, color: "bg-terra-warning" },
];

interface Recommendation {
  crop: string;
  score: number;
}

interface SoilData {
  n: number;
  p: number;
  k: number;
  ph: number;
  is_estimated?: boolean;
}

const SmartPlanner = () => {
  const [activeOverlay, setActiveOverlay] = useState<string>("moisture");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldData, setFieldData] = useState({
    area: "5.2 Acres",
    soil: "Red Loam",
    ph: "6.8",
    n: "Medium",
    p: "High",
    k: "Medium",
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [locationStatus, setLocationStatus] = useState("Using Default Location");
  const [userCoords, setUserCoords] = useState<number[] | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = [latitude, longitude];
          setUserCoords(coords);
          // Create a small bounding box
          const bbox = [latitude - 0.005, longitude - 0.005, latitude + 0.005, longitude + 0.005];
          setLocationStatus("📍 Using Your Live Location");
          fetchRecommendations(bbox, fieldData.soil);
        },
        (error) => {
          console.error("Location error:", error);
          setLocationStatus("⚠️ Location Error - Using Default");
          fetchRecommendations(undefined, fieldData.soil);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationStatus("⚠️ Geolocation not supported");
      fetchRecommendations(undefined, fieldData.soil);
    }
  };

  const fetchRecommendations = async (customBox?: number[], soilType?: string) => {
    setLoading(true);
    setError(null);

    const boxToSend = customBox || [11.0168, 76.9558, 11.0268, 76.9658];
    const targetSoil = soilType || fieldData.soil;

    try {
      const response = await fetch("http://localhost:8000/api/planner/recommend_satellite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coords: boxToSend,
          soil_type: targetSoil,
          temperature: 28,
          humidity: 65,
          rainfall: 120
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setFieldData({
          ...fieldData,
          soil: data.soil_data.type || targetSoil,
          ph: data.soil_data.ph.toString(),
          n: data.soil_data.n > 100 ? "High" : data.soil_data.n > 50 ? "Medium" : "Low",
          p: data.soil_data.p > 50 ? "High" : data.soil_data.p > 20 ? "Medium" : "Low",
          k: data.soil_data.k > 40 ? "High" : data.soil_data.k > 10 ? "Medium" : "Low",
        });
        setRecommendations(data.recommendations);
      } else {
        setError(data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError("Connect to local AI backend to view live analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleSoilChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSoil = e.target.value;
    setFieldData(prev => ({ ...prev, soil: newSoil }));
    const bbox = userCoords ? [userCoords[0] - 0.005, userCoords[1] - 0.005, userCoords[0] + 0.005, userCoords[1] + 0.005] : undefined;
    fetchRecommendations(bbox, newSoil);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Map className="w-5 h-5 text-accent" />
            </div>
            Smart Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Digital twin of your field with AI recommendations
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Map Container */}
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border h-[400px] lg:h-[500px]">
            {/* Placeholder Map with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-terra-forest/20 via-accent/10 to-terra-info/20">
              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--accent) / 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--accent) / 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Field Boundary */}
              <svg className="absolute inset-0 w-full h-full">
                <motion.polygon
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    fill: error ? "rgba(239, 68, 68, 0.1)" : "hsl(var(--accent) / 0.2)",
                    stroke: error ? "rgba(239, 68, 68, 0.5)" : "hsl(var(--accent))"
                  }}
                  points="100,80 350,60 400,200 380,350 150,380 80,250"
                  strokeWidth="3"
                  strokeDasharray="10,5"
                  className={loading ? "animate-pulse" : ""}
                />
                {/* Scanning Line Animation */}
                {loading && (
                  <motion.line
                    initial={{ y1: 60, y2: 60 }}
                    animate={{ y1: 380, y2: 380 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    x1="80" x2="400"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_hsl(var(--accent))]"
                  />
                )}
                {/* Field sections */}
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  x1="200" y1="100" x2="200" y2="350"
                  stroke="hsl(var(--accent) / 0.5)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>

              {/* Moisture Overlay */}
              {activeOverlay === "moisture" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 30% 40%, hsl(199 89% 48% / 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, hsl(199 89% 48% / 0.6) 0%, transparent 40%)",
                  }}
                />
              )}

              {/* NDVI Overlay */}
              {activeOverlay === "ndvi" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 40% 50%, hsl(158 65% 52% / 0.5) 0%, hsl(38 92% 50% / 0.3) 60%, hsl(0 84% 60% / 0.2) 100%)",
                  }}
                />
              )}

              {/* Temperature Overlay */}
              {activeOverlay === "temperature" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(ellipse at 60% 40%, hsl(38 92% 50% / 0.5) 0%, hsl(0 84% 60% / 0.3) 70%)",
                  }}
                />
              )}

              {/* Map Labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium border border-border/50">
                  {locationStatus}
                </div>
              </div>

              {/* Weather Mini Card */}
              <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 border border-border/50">
                <Cloud className="w-4 h-4 text-terra-info" />
                <span className="text-sm font-medium">28°C</span>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 border border-border/50">
              <p className="text-xs font-medium mb-2">
                {activeOverlay === "moisture" && "Soil Moisture Level"}
                {activeOverlay === "ndvi" && "Vegetation Health (NDVI)"}
                {activeOverlay === "temperature" && "Surface Temperature"}
              </p>
              <div className="flex items-center gap-1">
                <div className={`w-4 h-3 rounded-sm ${activeOverlay === "moisture" ? "bg-terra-info/30" :
                  activeOverlay === "ndvi" ? "bg-destructive/50" : "bg-accent/30"
                  }`} />
                <div className={`w-4 h-3 rounded-sm ${activeOverlay === "moisture" ? "bg-terra-info/60" :
                  activeOverlay === "ndvi" ? "bg-terra-warning/50" : "bg-terra-warning/50"
                  }`} />
                <div className={`w-4 h-3 rounded-sm ${activeOverlay === "moisture" ? "bg-terra-info" :
                  activeOverlay === "ndvi" ? "bg-accent" : "bg-destructive/50"
                  }`} />
                <span className="text-xs text-muted-foreground ml-2">
                  {activeOverlay === "moisture" ? "Low → High" :
                    activeOverlay === "ndvi" ? "Poor → Good" : "Cool → Hot"}
                </span>
              </div>
            </div>
          </div>

          {/* Overlay Controls */}
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 bg-card rounded-xl p-1 border border-border">
              <Layers className="w-4 h-4 ml-2 text-muted-foreground" />
              {overlayOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveOverlay(option.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeOverlay === option.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>

            {/* Soil Selector */}
            <div className="flex items-center gap-2 bg-card rounded-xl px-3 py-1 border border-border">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Soil Type:</span>
              <select
                value={fieldData.soil}
                onChange={handleSoilChange}
                className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer py-1"
              >
                <option value="Red Loam">Red Loam</option>
                <option value="Black Soil">Black Soil</option>
                <option value="Alluvial">Alluvial</option>
                <option value="Sandy">Sandy</option>
                <option value="Clayey">Clayey</option>
                <option value="Laterite">Laterite</option>
              </select>
            </div>
          </div>

          {/* Field Info Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Area</p>
              <p className="text-sm font-bold mt-1">{fieldData.area}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Soil Type</p>
              <p className="text-sm font-bold mt-1">{fieldData.soil}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" title="Satellite Live" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">pH Level</p>
              <p className="text-sm font-bold mt-1 text-accent">{fieldData.ph}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-terra-neon-glow">Nitrogen (N)</p>
              <p className="text-sm font-bold mt-1">{fieldData.n}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phosphorus (P)</p>
              <p className="text-sm font-bold mt-1">{fieldData.p}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Potassium (K)</p>
              <p className="text-sm font-bold mt-1">{fieldData.k}</p>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-bento">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-terra-warning" />
                <h2 className="font-semibold">AI Recommendations</h2>
              </div>
              <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full font-medium">
                {fieldData.soil}
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="py-20 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-sm text-muted-foreground">Analyzing satellite patterns...</p>
                </div>
              ) : error ? (
                <div className="py-10 px-4 text-center bg-destructive/5 rounded-xl border border-destructive/10">
                  <p className="text-sm text-destructive mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => getUserLocation()}>
                    Retry
                  </Button>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.crop}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-secondary/30 rounded-xl cursor-pointer group border border-transparent hover:border-accent/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold capitalize text-foreground">{rec.crop}</h3>
                      <span className="text-accent text-sm font-black italic">{rec.suitability}% Match</span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rec.suitability}%` }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-accent via-terra-neon-glow to-terra-forest rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                      />
                    </div>

                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      {rec.reason}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-border">
              <Button variant="accent" className="w-full" size="touch">
                Generate Crop Plan
              </Button>
            </div>
          </div>

          {/* Quick Tip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-terra-forest to-terra-forest-light rounded-2xl p-5 text-primary-foreground"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Pro Tip</h3>
                <p className="text-sm text-primary-foreground/80">
                  Your soil pH of 6.8 is ideal for most crops. Consider crop rotation to maintain nutrient balance.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartPlanner;
