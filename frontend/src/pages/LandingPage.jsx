import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'

function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
    </div>
  )
}

export default LandingPage