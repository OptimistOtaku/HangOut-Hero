import { useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { generateItinerary, PreferenceFormData, LocationFormData, ItineraryResponse } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

export default function Loading() {
  const { toast } = useToast();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Retrieve preference and location data from session storage
        const preferenceDataStr = sessionStorage.getItem('preferenceData');
        const locationDataStr = sessionStorage.getItem('locationData');

        if (!preferenceDataStr || !locationDataStr) {
          toast({
            title: "Missing information",
            description: "We couldn't find your preferences or location data. Please start over.",
            variant: "destructive"
          });
          window.location.href = "/";
          return;
        }

        const preferenceData: PreferenceFormData = JSON.parse(preferenceDataStr);
        const locationData: LocationFormData = JSON.parse(locationDataStr);

        // Generate itinerary
        const itinerary = await generateItinerary(preferenceData, locationData);
        
        // Save the generated itinerary to session storage
        sessionStorage.setItem('itineraryData', JSON.stringify(itinerary));
        
        // Allow loading animation to run for at least 2 seconds
        setTimeout(() => {
          window.location.href = "/results";
        }, 2000);
      } catch (error) {
        console.error("Error generating itinerary:", error);
        toast({
          title: "Error",
          description: "Failed to generate your itinerary. Please try again.",
          variant: "destructive"
        });
        window.location.href = "/questionnaire";
      }
    };

    fetchItinerary();
  }, [toast]);

  return (
    <section className="py-16 min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <i className="fas fa-map-location-dot text-primary text-3xl animate-pulse"></i>
          </div>
        </div>
        
        <h2 className="text-3xl font-heading font-bold mb-4">Creating your perfect itinerary</h2>
        <p className="text-gray-700 mb-10 max-w-md mx-auto">Our AI is crafting a personalized day plan just for you. This usually takes about 15-20 seconds.</p>
        
        <div className="w-full max-w-md mx-auto h-2 bg-gray-100 rounded-full overflow-hidden mb-10">
          <div className="h-full bg-primary rounded-full animate-progress"></div>
        </div>
        
        <Card className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-md">
          <CardContent className="p-0">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-decorative/20 flex items-center justify-center">
                <i className="fas fa-lightbulb text-decorative"></i>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-1">Did you know?</h3>
                <p className="text-gray-700 text-sm">We consider over 200 factors when planning your perfect day, including weather, crowd levels, and transportation options.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
