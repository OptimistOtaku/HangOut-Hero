interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { id: 1, name: "Preferences" },
    { id: 2, name: "Location" },
    { id: 3, name: "Results" }
  ];

  return (
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step circle with number or checkmark */}
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium
              ${currentStep > step.id 
                ? 'bg-accent text-white' 
                : currentStep === step.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-300 text-white'}`}
          >
            {currentStep > step.id ? (
              <i className="fas fa-check"></i>
            ) : (
              step.id
            )}
          </div>
          
          {/* Step name */}
          <span className={`font-medium ml-3 ${currentStep >= step.id ? '' : 'text-gray-700'}`}>
            {step.name}
          </span>
          
          {/* Connector line (except after the last step) */}
          {index < steps.length - 1 && (
            <div 
              className={`h-1 w-16 ml-3
                ${currentStep > step.id + 1 
                  ? 'bg-accent' 
                  : currentStep > step.id 
                    ? 'bg-accent' 
                    : 'bg-gray-300'}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
