import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { Calendar, Users, Star, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const handleGetStarted = () => {
    if (identity) {
      navigate({ to: '/guest/events' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy-dark to-navy py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="/assets/generated/fiesta-logo.dim_400x120.png" 
            alt="FIESTA" 
            className="h-16 md:h-20 w-auto mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Future-ready Intelligent Event Solution
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Plan your perfect event with professional organizers. Compare, book, and celebrate with confidence.
          </p>
          {identity ? (
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gold hover:bg-gold-dark text-navy font-semibold text-lg px-8 py-6"
            >
              Go to Dashboard
            </Button>
          ) : (
            <p className="text-gray-300 text-lg">
              Please login to get started
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-12">
            Why Choose FIESTA?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-12 w-12 text-gold" />}
              title="Easy Event Planning"
              description="Create and manage events with our intuitive interface. Wedding, birthday, corporate - we've got you covered."
            />
            <FeatureCard
              icon={<Users className="h-12 w-12 text-gold" />}
              title="Discover Organizers"
              description="Browse and filter professional event organizers based on your specific requirements and preferences."
            />
            <FeatureCard
              icon={<Star className="h-12 w-12 text-gold" />}
              title="Compare & Choose"
              description="Side-by-side comparison of organizers with ratings, experience, pricing, and contact details."
            />
            <FeatureCard
              icon={<TrendingUp className="h-12 w-12 text-gold" />}
              title="Track Progress"
              description="Monitor booking status, leave reviews, and manage all your events from one dashboard."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy to-navy-dark">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Plan Your Next Event?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join FIESTA today and connect with the best event organizers in your area.
          </p>
          {!identity && (
            <p className="text-gray-300 text-lg">
              Login to start planning your perfect event
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg transition-shadow border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-navy mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
