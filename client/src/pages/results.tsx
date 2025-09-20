import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { ItineraryTimeline } from "@/components/ui/itinerary-timeline";
import { RecommendationCard } from "@/components/ui/recommendation-card";
import { useToast } from "@/hooks/use-toast";
import { ItineraryResponse } from "@/lib/openai";

export default function Results() {
  const { toast } = useToast();
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);

  useEffect(() => {
    // Retrieve itinerary data from session storage
    const itineraryData = sessionStorage.getItem('itineraryData');
    
    if (itineraryData) {
      setItinerary(JSON.parse(itineraryData));
    } else {
      toast({
        title: "Missing itinerary data",
        description: "We couldn't find your itinerary. Please start over.",
        variant: "destructive"
      });
      window.location.href = "/";
    }
  }, [toast]);

  const handlePlanAnother = () => {
    // Clear session storage and start over
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleShare = () => {
    toast({
      title: "Share feature",
      description: "This feature is coming soon!",
    });
  };

  const handleSave = () => {
    toast({
      title: "Save feature",
      description: "This feature is coming soon!",
    });
  };

  const handleCustomize = () => {
    toast({
      title: "Customize feature",
      description: "This feature is coming soon!",
    });
  };

  if (!itinerary) {
    return (
      <div className="py-16 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <ProgressSteps currentStep={3} />

        <div className="mb-8 mt-8">
          <Card className="bg-white rounded-2xl shadow-md">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-3xl font-heading font-bold">{itinerary.title}</h2>
                  <p className="text-gray-700">{itinerary.description}</p>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    className="border border-gray-300 hover:border-primary text-text"
                    onClick={handleShare}
                  >
                    <i className="fas fa-share-nodes mr-2"></i> Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border border-gray-300 hover:border-primary text-text"
                    onClick={handleSave}
                  >
                    <i className="fas fa-download mr-2"></i> Save
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-[#FF6B85] text-white"
                    onClick={handleCustomize}
                  >
                    <i className="fas fa-pen-to-square mr-2"></i> Customize
                  </Button>
                </div>
              </div>
              
              {/* Map preview */}
              <div className="h-72 md:h-96 w-full rounded-xl overflow-hidden mb-8 bg-gray-100 relative">
                <img 
                  src="https://pixabay.com/get/g99141ba9d81b7616d264b7bbb20a278b731bfd4715928d66825ccdc52b0fb6a8a38fbb3079c501680cffd5772dc74caecd4c6dc59d74a672fb60d2b2fc6d8cc4_1280.jpg" 
                  alt={`Map of ${itinerary.location} with itinerary points`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 left-4 bg-white py-2 px-4 rounded-lg shadow-md">
                  <p className="font-medium">{itinerary.location}</p>
                </div>
              </div>
              
              {/* Timeline view */}
              <ItineraryTimeline activities={itinerary.activities} />
            </div>
          </Card>
        </div>
        
        {/* Recommendations section */}
        {itinerary.recommendations && itinerary.recommendations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-heading font-bold mb-6">Similar Adventures You Might Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {itinerary.recommendations.map((recommendation) => (
                <RecommendationCard 
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Button 
            className="bg-primary hover:bg-[#FF6B85] text-white font-medium py-3 px-8 rounded-xl"
            onClick={handlePlanAnother}
          >
            Plan Another Adventure
          </Button>
        </div>
      </div>
    </section>
  );
}
