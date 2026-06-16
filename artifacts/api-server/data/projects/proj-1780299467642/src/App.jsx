import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import WorkoutPlans from './components/WorkoutPlans';
import LiveCoaching from './components/LiveCoaching';
import NutritionTracking from './components/NutritionTracking';
import WearableSync from './components/WearableSync';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <WorkoutPlans />
      <LiveCoaching />
      <NutritionTracking />
      <WearableSync />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}

export default App;