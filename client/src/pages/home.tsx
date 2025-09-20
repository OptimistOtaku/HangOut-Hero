import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const handleStartPlanning = () => {
    window.location.href = "/questionnaire";
  };

  return (
    <section className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-text mb-6">
          Discover your perfect <span className="text-primary">hangout itinerary</span>
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
          Let our AI create a personalized day plan based on your preferences and location. No more endless searching or decision fatigue.
        </p>
        
        <Card className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <Button 
              onClick={handleStartPlanning}
              className="w-full md:w-auto bg-primary hover:bg-[#FF6B85] text-white text-lg font-medium py-6 px-8 rounded-xl"
            >
              Start Planning
            </Button>
            <Button 
              variant="outline"
              className="w-full md:w-auto border border-gray-300 hover:border-primary text-text text-lg font-medium py-6 px-8 rounded-xl"
            >
              Browse Examples
            </Button>
          </div>
        </Card>
        
        {/* Featured Images Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* City exploration */}
          <div className="rounded-xl overflow-hidden h-80 relative group">
            <img 
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
              alt="City exploration scene" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-5 text-white text-left">
                <h3 className="font-heading font-bold text-xl">City Adventures</h3>
                <p className="text-white/80">Explore hidden gems and local favorites</p>
              </div>
            </div>
          </div>
          
          {/* Cafe hopping */}
          <div className="rounded-xl overflow-hidden h-80 relative group">
            <img 
              src="https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
              alt="Cafe atmosphere with people enjoying coffee" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-5 text-white text-left">
                <h3 className="font-heading font-bold text-xl">Cafe Hopping</h3>
                <p className="text-white/80">Find the perfect spots to relax and recharge</p>
              </div>
            </div>
          </div>
          
          {/* Historical landmarks */}
          <div className="rounded-xl overflow-hidden h-80 relative group">
            <img 
              src="https://images.unsplash.com/photo-1547710272-f0cd2545f838?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000" 
              alt="Historical landmark with tourists" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-5 text-white text-left">
                <h3 className="font-heading font-bold text-xl">Cultural Experiences</h3>
                <p className="text-white/80">Immerse yourself in history and local culture</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
