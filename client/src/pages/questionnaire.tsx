import { useState } from "react";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { PreferenceCard } from "@/components/ui/preference-card";
import { PreferenceFormData } from "@/lib/openai";

export default function Questionnaire() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PreferenceFormData>({
    hangoutTypes: [],
    duration: "Full day",
    budget: "Mid-range"
  });

  const handleNext = () => {
    // Save form data to session storage
    sessionStorage.setItem('preferenceData', JSON.stringify(formData));
    navigate("/location");
  };

  const toggleHangoutType = (type: string) => {
    setFormData(prev => {
      const types = [...prev.hangoutTypes];
      const index = types.indexOf(type);
      
      if (index >= 0) {
        types.splice(index, 1);
      } else {
        types.push(type);
      }
      
      return { ...prev, hangoutTypes: types };
    });
  };

  const setDuration = (duration: string) => {
    setFormData(prev => ({ ...prev, duration }));
  };

  const setBudget = (budget: string) => {
    setFormData(prev => ({ ...prev, budget }));
  };

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={1} />

        <Card className="bg-white rounded-2xl shadow-md mt-8">
          <CardContent className="p-8">
            <h2 className="text-3xl font-heading font-bold mb-6">What kind of hangout are you looking for?</h2>
            <p className="text-gray-700 mb-8">Select all options that interest you. We'll create the perfect blend.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PreferenceCard
                title="Exploring"
                description="Discover hidden gems, viewpoints, and local spots off the beaten path"
                icon="compass"
                color="primary-light"
                selected={formData.hangoutTypes.includes("Exploring")}
                onClick={() => toggleHangoutType("Exploring")}
              />
              
              <PreferenceCard
                title="Eating"
                description="Sample delicious local cuisine from trendy restaurants to authentic street food"
                icon="utensils"
                color="accent"
                selected={formData.hangoutTypes.includes("Eating")}
                onClick={() => toggleHangoutType("Eating")}
              />
              
              <PreferenceCard
                title="Historical"
                description="Visit museums, landmarks, and significant cultural and historical sites"
                icon="landmark"
                color="decorative"
                selected={formData.hangoutTypes.includes("Historical")}
                onClick={() => toggleHangoutType("Historical")}
              />
              
              <PreferenceCard
                title="Cafe Hopping"
                description="Relax in cozy cafes with great ambiance, coffee, and sweet treats"
                icon="coffee"
                color="secondary"
                selected={formData.hangoutTypes.includes("Cafe Hopping")}
                onClick={() => toggleHangoutType("Cafe Hopping")}
              />
            </div>
            
            <div className="mb-8">
              <h3 className="font-heading font-medium text-lg mb-3">How much time do you have?</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={formData.duration === "2-3 hours" ? "default" : "outline"}
                  className={`rounded-lg ${formData.duration === "2-3 hours" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setDuration("2-3 hours")}
                >
                  2-3 hours
                </Button>
                <Button 
                  variant={formData.duration === "Half day" ? "default" : "outline"}
                  className={`rounded-lg ${formData.duration === "Half day" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setDuration("Half day")}
                >
                  Half day
                </Button>
                <Button 
                  variant={formData.duration === "Full day" ? "default" : "outline"}
                  className={`rounded-lg ${formData.duration === "Full day" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setDuration("Full day")}
                >
                  Full day
                </Button>
                <Button 
                  variant={formData.duration === "Evening" ? "default" : "outline"}
                  className={`rounded-lg ${formData.duration === "Evening" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setDuration("Evening")}
                >
                  Evening
                </Button>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-heading font-medium text-lg mb-3">What's your budget level?</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={formData.budget === "Budget-friendly" ? "default" : "outline"}
                  className={`rounded-lg ${formData.budget === "Budget-friendly" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setBudget("Budget-friendly")}
                >
                  Budget-friendly
                </Button>
                <Button 
                  variant={formData.budget === "Mid-range" ? "default" : "outline"}
                  className={`rounded-lg ${formData.budget === "Mid-range" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setBudget("Mid-range")}
                >
                  Mid-range
                </Button>
                <Button 
                  variant={formData.budget === "Luxury" ? "default" : "outline"}
                  className={`rounded-lg ${formData.budget === "Luxury" ? "bg-primary text-white" : "border-gray-300 hover:border-primary"}`}
                  onClick={() => setBudget("Luxury")}
                >
                  Luxury
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleNext}
                className="bg-primary hover:bg-[#FF6B85] text-white font-medium py-3 px-8 rounded-xl"
                disabled={formData.hangoutTypes.length === 0}
              >
                Next <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
