import { ActivityCard } from "./activity-card.jsx";
import { ItineraryActivity } from "@/lib/openai";

interface ItineraryTimelineProps {
  activities: ItineraryActivity[];
}

export function ItineraryTimeline({ activities }: ItineraryTimelineProps) {
  // Group activities by time of day
  const morningActivities = activities.filter(activity => activity.timeOfDay === "morning");
  const afternoonActivities = activities.filter(activity => activity.timeOfDay === "afternoon");
  const eveningActivities = activities.filter(activity => activity.timeOfDay === "evening");

  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-100"></div>
      
      {/* Morning activities */}
      {morningActivities.length > 0 && (
        <div className="mb-8 relative">
          <div className="flex">
            <div className="timeline-dot w-16 h-16 rounded-full bg-accent flex-shrink-0 flex items-center justify-center z-10 shadow-md">
              <i className="fas fa-sun text-white text-xl"></i>
            </div>
            <div className="ml-6 pt-2">
              <h3 className="text-2xl font-heading font-bold mb-6">Morning</h3>
              
              {morningActivities.map((activity, index) => (
                <ActivityCard 
                  key={activity.id}
                  activity={activity}
                  timeOfDay="morning"
                  isLast={index === morningActivities.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Afternoon activities */}
      {afternoonActivities.length > 0 && (
        <div className="mb-8 relative">
          <div className="flex">
            <div className="timeline-dot w-16 h-16 rounded-full bg-primary flex-shrink-0 flex items-center justify-center z-10 shadow-md">
              <i className="fas fa-cloud-sun text-white text-xl"></i>
            </div>
            <div className="ml-6 pt-2">
              <h3 className="text-2xl font-heading font-bold mb-6">Afternoon</h3>
              
              {afternoonActivities.map((activity, index) => (
                <ActivityCard 
                  key={activity.id}
                  activity={activity}
                  timeOfDay="afternoon"
                  isLast={index === afternoonActivities.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Evening activities */}
      {eveningActivities.length > 0 && (
        <div className="relative">
          <div className="flex">
            <div className="timeline-dot w-16 h-16 rounded-full bg-[#A78BFA] flex-shrink-0 flex items-center justify-center z-10 shadow-md">
              <i className="fas fa-moon text-white text-xl"></i>
            </div>
            <div className="ml-6 pt-2">
              <h3 className="text-2xl font-heading font-bold mb-6">Evening</h3>
              
              {eveningActivities.map((activity, index) => (
                <ActivityCard 
                  key={activity.id}
                  activity={activity}
                  timeOfDay="evening"
                  isLast={index === eveningActivities.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
