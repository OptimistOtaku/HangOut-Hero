import { useToast } from "@/hooks/use-toast";
import { ItineraryActivity } from "@/lib/openai";

interface ActivityCardProps {
  activity: ItineraryActivity;
  timeOfDay: "morning" | "afternoon" | "evening";
  isLast: boolean;
}

export function ActivityCard({ activity, timeOfDay, isLast }: ActivityCardProps) {
  const { toast } = useToast();
  
  const colorMap = {
    "morning": "accent",
    "afternoon": "primary",
    "evening": "decorative"
  };
  
  const timeColor = colorMap[timeOfDay];
  
  const handleBookmark = () => {
    toast({
      title: "Bookmarked!",
      description: `${activity.title} has been added to your bookmarks.`,
    });
  };
  
  return (
    <div className={`bg-white border border-gray-300 rounded-xl p-6 ${isLast ? '' : 'mb-6'} transition-colors`}>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 h-48 rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-6">
          <img 
            src={activity.image} 
            alt={activity.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-2/3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium mb-2 inline-block
                ${timeOfDay === "morning" ? "bg-accent/20 text-accent" : 
                timeOfDay === "afternoon" ? "bg-primary/20 text-primary" : 
                "bg-[#A78BFA]/20 text-[#A78BFA]"}`}>
                {activity.time}
              </span>
              <h4 className="text-xl font-heading font-bold">{activity.title}</h4>
            </div>
            <div className="flex space-x-1">
              <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">{activity.price}</span>
              <span className="bg-decorative/10 text-decorative px-2 py-1 rounded text-xs">{activity.rating} ★</span>
            </div>
          </div>
          <p className="text-gray-700 mb-2">{activity.description}</p>
          {activity.justification && (
            <p className="text-xs text-gray-500 italic mb-2">{activity.justification}</p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              <i className="fas fa-location-dot mr-1"></i> {activity.location}
            </span>
            <div className="flex space-x-2">
              {activity.directionsUrl && (
                <a
                  href={activity.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary transition-colors"
                  title="Get Directions"
                >
                  <i className="fas fa-directions"></i>
                </a>
              )}
              {activity.googleMapsLink && (
                <a
                  href={activity.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary transition-colors"
                  title="View on Google Maps"
                >
                  <i className="fas fa-map-marker-alt"></i>
                </a>
              )}
              <button 
                className="text-gray-700 hover:text-primary transition-colors"
                onClick={handleBookmark}
              >
                <i className="fas fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
