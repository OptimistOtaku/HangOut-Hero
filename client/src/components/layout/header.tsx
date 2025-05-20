import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-heading font-bold text-text">Wanderplan</h1>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">How it works</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">Inspiration</a>
            <a href="#" className="text-gray-700 hover:text-primary transition-colors">About</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="hidden md:block text-text font-medium hover:text-primary"
            >
              Sign In
            </Button>
            
            {location === "/" ? (
              <Button 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-[#FF6B85]"
              >
                Get Started
              </Button>
            ) : (
              <Link href="/">
                <Button 
                  variant="outline"
                  className="border border-gray-300 hover:border-primary text-text"
                >
                  Home
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              className="md:hidden text-gray-700 p-2"
            >
              <i className="fas fa-bars text-xl"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
