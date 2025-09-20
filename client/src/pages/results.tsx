import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";
import { ProgressSteps } from "../components/ui/progress-steps.jsx";
import { ItineraryTimeline } from "../components/ui/itinerary-timeline.jsx";
import { RecommendationCard } from "../components/ui/recommendation-card.jsx";
import { useToast } from "../hooks/use-toast.ts";
import { ItineraryResponse } from "../lib/openai.js";
import { supabase } from "../lib/supabase.js";
import { useLoginModal } from "../components/layout/header.jsx";

export default function Results() {
  const { toast } = useToast();
  const openLoginModal = useLoginModal();
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [showMyItineraries, setShowMyItineraries] = useState(false);
  const [myItineraries, setMyItineraries] = useState<any[]>([]);
  const [loadingMyItineraries, setLoadingMyItineraries] = useState(false);
  const myItinerariesFetched = useRef(false);
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null);

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends.",
      });
    } catch {
      toast({
        title: "Share failed",
        description: "Could not copy link.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      if (openLoginModal) openLoginModal();
      return;
    }
    try {
      const res = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(itinerary)
      });
      if (res.ok) {
        toast({
          title: "Itinerary saved!",
          description: "You can view it in your profile.",
        });
      } else {
        const data = await res.json();
        toast({
          title: "Save failed",
          description: data.message || "Could not save itinerary.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description: "Could not save itinerary.",
        variant: "destructive"
      });
    }
  };

  const handleCustomize = () => {
    toast({
      title: "Customize feature",
      description: "This feature is coming soon!",
    });
  };

  const handleMyItineraries = async () => {
    setShowMyItineraries(true);
    if (myItinerariesFetched.current) return;
    setLoadingMyItineraries(true);
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      setMyItineraries([]);
      setLoadingMyItineraries(false);
      return;
    }
    try {
      const res = await fetch("/api/itineraries", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMyItineraries(data.itineraries || []);
        myItinerariesFetched.current = true;
      } else {
        setMyItineraries([]);
      }
    } finally {
      setLoadingMyItineraries(false);
    }
  };

  const handleViewItinerary = (iti: any) => {
    setSelectedItinerary(iti);
  };
  const handleCloseDetails = () => {
    setSelectedItinerary(null);
  };

  const handleDeleteItinerary = async (iti: any) => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to delete your itinerary.",
        variant: "destructive"
      });
      return;
    }
    try {
      const res = await fetch(`/api/itineraries/${iti.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        setMyItineraries((prev) => prev.filter((item) => item.id !== iti.id));
        toast({
          title: "Itinerary deleted!",
          description: "The itinerary has been removed.",
        });
        if (selectedItinerary?.id === iti.id) setSelectedItinerary(null);
      } else {
        toast({
          title: "Delete failed",
          description: "Could not delete itinerary.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Could not delete itinerary.",
        variant: "destructive"
      });
    }
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
                    variant="outline" 
                    className="border border-gray-300 hover:border-primary text-text"
                    onClick={handleMyItineraries}
                  >
                    <i className="fas fa-list mr-2"></i> My Itineraries
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
      {showMyItineraries && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowMyItineraries(false)}>
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">My Saved Itineraries</h2>
            {loadingMyItineraries ? (
              <div className="text-center py-8">Loading...</div>
            ) : myItineraries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No saved itineraries found.</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myItineraries.map((iti) => (
                  <div key={iti.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-bold text-lg">{iti.title}</div>
                      <div className="text-gray-600">{iti.location}</div>
                      <div className="text-xs text-gray-400">{new Date(iti.created_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 md:mt-0 md:ml-4 flex gap-2">
                      <Button size="sm" onClick={() => handleViewItinerary(iti)}>
                        View
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItinerary(iti)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedItinerary && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
                <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleCloseDetails}>
                    &times;
                  </button>
                  <h3 className="text-xl font-bold mb-2">{selectedItinerary.title}</h3>
                  <div className="mb-2 text-gray-600">{selectedItinerary.location}</div>
                  <div className="mb-4 text-xs text-gray-400">{new Date(selectedItinerary.created_at).toLocaleString()}</div>
                  <div className="mb-4">
                    <strong>Description:</strong> {selectedItinerary.description}
                  </div>
                  <div className="mb-4">
                    <strong>Activities:</strong>
                    <ul className="list-disc ml-6">
                      {selectedItinerary.activities?.map((a: any, idx: number) => (
                        <li key={idx}>{a.title} - {a.time} - {a.location}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Recommendations:</strong>
                    <ul className="list-disc ml-6">
                      {selectedItinerary.recommendations?.map((r: any, idx: number) => (
                        <li key={idx}>{r.title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
