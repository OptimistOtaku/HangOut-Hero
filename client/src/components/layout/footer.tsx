import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">How it works</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Our story</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Press</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Destinations</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">San Francisco</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">New York</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Los Angeles</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Chicago</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Contact us</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-700 hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Join Us</h3>
            <p className="text-gray-700 mb-4">Get personalized recommendations and updates.</p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="border border-gray-300 rounded-l-lg focus:border-primary"
              />
              <Button className="bg-primary hover:bg-[#FF6B85] text-white rounded-l-none">
                <i className="fas fa-arrow-right"></i>
              </Button>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-700 hover:text-primary transition-colors"><i className="fab fa-instagram text-xl"></i></a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors"><i className="fab fa-facebook text-xl"></i></a>
              <a href="#" className="text-gray-700 hover:text-primary transition-colors"><i className="fab fa-pinterest text-xl"></i></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-700">
          <p>© {new Date().getFullYear()} Wanderplan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
