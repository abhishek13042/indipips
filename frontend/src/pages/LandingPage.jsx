import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Pricing from '../components/Pricing'
import WhyUs from '../components/WhyUs'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <WhyUs />
      <FAQ />
      <Footer />
    </div>
  )
}

export default LandingPage