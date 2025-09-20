import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.jsx";
import { ProgressSteps } from "../components/ui/progress-steps.jsx";
import { PreferenceFormData, LocationFormData } from "../lib/openai.js";

interface LocationOption {
  name: string;
  image: string;
  selected: boolean;
}

// Add a static list of popular Indian cities for suggestions
const CITY_SUGGESTIONS = [
  "Delhi", "Noida", "Jaipur", "Chandigarh", "Mumbai", "Bangalore", "Hyderabad", "Pune", "Kolkata", "Chennai", "Ahmedabad", "Lucknow", "Indore", "Bhopal", "Patna", "Nagpur", "Kanpur", "Surat", "Vadodara", "Ludhiana", "Agra", "Varanasi", "Amritsar", "Shimla", "Dehradun", "Guwahati", "Ranchi", "Raipur", "Jodhpur", "Udaipur", "Mysore", "Coimbatore", "Thiruvananthapuram", "Vijayawada", "Visakhapatnam"
];

export default function Location() {
  const [locationData, setLocationData] = useState<LocationFormData>({
    location: "Delhi",
    distance: "Moderate (up to 5 miles)",
    transportation: ["Walking", "Public Transit"]
  });
  
  const [preferenceData, setPreferenceData] = useState<PreferenceFormData | null>(null);
  
  const [locations, setLocations] = useState<LocationOption[]>([
    { 
      name: "Delhi", 
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&h=250", 
      selected: true 
    },
    { 
      name: "Noida", 
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&h=250", 
      selected: false 
    },
    { 
      name: "Jaipur", 
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&h=250", 
      selected: false 
    },
    { 
      name: "Chandigarh", 
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&h=250", 
      selected: false 
    }
  ]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Retrieve preference data from session storage
    const savedPrefs = sessionStorage.getItem('preferenceData');
    if (savedPrefs) {
      setPreferenceData(JSON.parse(savedPrefs));
    } else {
      // Redirect back to questionnaire if no preference data exists
      window.location.href = "/questionnaire";
    }
  }, []);

  const handleBack = () => {
    window.location.href = "/questionnaire";
  };

  const handleGenerate = () => {
    // Save location data to session storage
    sessionStorage.setItem('locationData', JSON.stringify(locationData));
    window.location.href = "/loading";
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationData((prev: LocationFormData) => ({ ...prev, location: value }));
    if (value.length > 0) {
      const filtered = CITY_SUGGESTIONS.filter(city =>
        city.toLowerCase().startsWith(value.toLowerCase()) && city.toLowerCase() !== value.toLowerCase()
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city: string) => {
    setLocationData((prev: LocationFormData) => ({ ...prev, location: city }));
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleDistanceChange = (value: string) => {
    setLocationData((prev: LocationFormData) => ({ ...prev, distance: value }));
  };

  const toggleTransportation = (type: string) => {
    setLocationData((prev: LocationFormData) => {
      const types = [...prev.transportation];
      const index = types.indexOf(type);
      if (index >= 0) {
        types.splice(index, 1);
      } else {
        types.push(type);
      }
      return { ...prev, transportation: types };
    });
  };

  const selectLocation = (name: string) => {
    setLocationData((prev: LocationFormData) => ({ ...prev, location: name }));
    setLocations((prev: LocationOption[]) => 
      prev.map(loc => ({
        ...loc,
        selected: loc.name === name
      }))
    );
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={2} />

        <Card className="bg-white rounded-2xl shadow-md mt-8">
          <CardContent className="p-8">
            <h2 className="text-3xl font-heading font-bold mb-6">Where would you like to hang out?</h2>
            <p className="text-gray-700 mb-8">Tell us the city or neighborhood you're interested in exploring.</p>
            
            <div className="mb-8 relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-700"></i>
                </div>
                <Input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Enter a city or neighborhood" 
                  className="w-full border border-gray-300 focus:border-primary rounded-xl py-4 pl-12 pr-4 text-lg" 
                  value={locationData.location}
                  onChange={handleLocationChange}
                  onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                  autoComplete="off"
                />
                {showSuggestions && (
                  <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {filteredSuggestions.map(city => (
                      <div
                        key={city}
                        className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-base"
                        onClick={() => handleSuggestionClick(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Popular locations */}
            <div className="mb-8">
              <h3 className="font-heading font-medium text-lg mb-4">Popular locations</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {locations.map((location) => (
                  <div 
                    key={location.name}
                    className={`cursor-pointer rounded-xl overflow-hidden relative h-32 group ${location.selected ? 'border-2 border-primary' : ''}`}
                    onClick={() => selectLocation(location.name)}
                  >
                    <img 
                      src={location.image} 
                      alt={`${location.name} cityscape`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 ${location.selected ? 'bg-primary/30' : 'bg-black/30'} group-hover:bg-black/20 flex items-center justify-center transition-colors`}>
                      <span className="text-white font-medium text-lg">{location.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Additional preferences */}
            <div className="mb-8">
              <h3 className="font-heading font-medium text-lg mb-4">Additional preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Maximum distance willing to travel</label>
                  <Select 
                    value={locationData.distance}
                    onValueChange={handleDistanceChange}
                  >
                    <SelectTrigger className="w-full border border-gray-300 focus:border-primary rounded-xl py-3 px-4">
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Walking distance only (1-2 miles)">Walking distance only (1-2 miles)</SelectItem>
                      <SelectItem value="Moderate (up to 5 miles)">Moderate (up to 5 miles)</SelectItem>
                      <SelectItem value="Any distance (with transportation)">Any distance (with transportation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Transportation preferences</label>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant={locationData.transportation.includes("Walking") ? "default" : "outline"}
                      className={`rounded-lg ${locationData.transportation.includes("Walking") ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                      onClick={() => toggleTransportation("Walking")}
                    >
                      Walking
                    </Button>
                    <Button 
                      variant={locationData.transportation.includes("Public Transit") ? "default" : "outline"}
                      className={`rounded-lg ${locationData.transportation.includes("Public Transit") ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                      onClick={() => toggleTransportation("Public Transit")}
                    >
                      Public Transit
                    </Button>
                    <Button 
                      variant={locationData.transportation.includes("Rideshare") ? "default" : "outline"}
                      className={`rounded-lg ${locationData.transportation.includes("Rideshare") ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                      onClick={() => toggleTransportation("Rideshare")}
                    >
                      Rideshare
                    </Button>
                    <Button 
                      variant={locationData.transportation.includes("Driving") ? "default" : "outline"}
                      className={`rounded-lg ${locationData.transportation.includes("Driving") ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                      onClick={() => toggleTransportation("Driving")}
                    >
                      Driving
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline"
                className="border border-gray-300 hover:border-primary text-text font-medium py-3 px-8 rounded-xl"
                onClick={handleBack}
              >
                <i className="fas fa-arrow-left mr-2"></i> Back
              </Button>
              <Button 
                className="bg-primary hover:bg-[#FF6B85] text-white font-medium py-3 px-8 rounded-xl"
                onClick={handleGenerate}
              >
                Generate Plan <i className="fas fa-wand-magic-sparkles ml-2"></i>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}