import LandingNav from './components/LandingNav';
import HeroSection from './sections/HeroSection';
import BentoSection from './sections/BentoSection';
import AgendaFeatureSection from './sections/AgendaFeatureSection';
import FinanceFeatureSection from './sections/FinanceFeatureSection';
import CtaSection from './sections/CtaSection';

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <LandingNav onGetStarted={onGetStarted} />
      <main>
        <HeroSection onGetStarted={onGetStarted} />
        <BentoSection />
        <AgendaFeatureSection />
        <FinanceFeatureSection />
        <CtaSection onGetStarted={onGetStarted} />
      </main>
    </div>
  );
}
