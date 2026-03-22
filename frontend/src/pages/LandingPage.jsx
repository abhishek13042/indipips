import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import StatsTicker from '../components/landing/StatsTicker'
import StatsBar from '../components/landing/StatsBar'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing from '../components/landing/Pricing'
import WhyUs from '../components/landing/WhyUs'
import LeaderboardPreview from '../components/landing/LeaderboardPreview'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-[#F9FAFB] font-inter">
      <Navbar />
      <Hero />
      <StatsTicker />
      <StatsBar />
      <HowItWorks />
      <Pricing />
      <WhyUs />
      <LeaderboardPreview />
      <FAQ />
      <Footer />
    </div>
  )
}

export default LandingPage
