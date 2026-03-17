import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import StatMarquee from '../components/StatMarquee'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'
import WhyUs from '../components/WhyUs'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

function LandingPage() {
  return (
    <div className="bg-[#050510] text-gray-200 min-h-screen">
      <Navbar />
      <Hero />
      <StatMarquee />
      <HowItWorks />
      <Pricing />
      <WhyUs />
      <FAQ />
      <Footer />
    </div>
  )
}

export default LandingPage