import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'
import WhyUs from '../components/WhyUs'
import FAQ from '../components/FAQ'

function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <WhyUs />
      <FAQ />
    </div>
  )
}

export default LandingPage