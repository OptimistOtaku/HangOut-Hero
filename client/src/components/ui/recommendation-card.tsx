import { useToast } from "@/hooks/use-toast";
import { Recommendation } from "@/lib/openai";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { toast } = useToast();
  
  const handleViewPlan = () => {
    toast({
      title: "Coming soon!",
      description: "This feature will be available in a future update.",
    });
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={recommendation.image} 
        alt={recommendation.title} 
        className="w-full h-48 object-cover"
        onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"; }}
      />
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-heading font-bold text-lg">{recommendation.title}</h4>
          <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">{recommendation.rating} ★</span>
        </div>
        <p className="text-gray-700 text-sm mb-4">{recommendation.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700">
            <i className="fas fa-clock mr-1"></i> {recommendation.duration}
          </span>
          <button 
            className="text-primary hover:text-[#FF6B85] transition-colors text-sm font-medium"
            onClick={handleViewPlan}
          >
            View Plan <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
