interface PreferenceCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}

export function PreferenceCard({ 
  title, 
  description, 
  icon, 
  color, 
  selected,
  onClick 
}: PreferenceCardProps) {
  // Map color string to actual Tailwind class
  const colorMap: Record<string, string> = {
    'primary': 'bg-primary',
    'primary-light': 'bg-[#FF6B85]',
    'secondary': 'bg-secondary',
    'accent': 'bg-accent',
    'decorative': 'bg-[#A78BFA]'
  };

  const bgColorClass = colorMap[color] || 'bg-primary';

  return (
    <div 
      className={`preference-card cursor-pointer border-2 ${selected ? 'border-primary' : 'border-gray-300 hover:border-primary'} rounded-xl p-6 flex items-start space-x-4`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 ${bgColorClass} rounded-lg flex items-center justify-center`}>
        <i className={`fas fa-${icon} text-white text-xl`}></i>
      </div>
      <div>
        <h3 className="font-heading font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}
