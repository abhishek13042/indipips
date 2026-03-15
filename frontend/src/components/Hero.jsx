import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-4 pt-16">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/30 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-sm font-medium">India's First Prop Trading Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
          Prove Your Skills.
          <br />
          <span className="text-green-400">Get Funded.</span>
          <br />
          Keep the Profits.
        </h1>

        {/* Subheading */}
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          India's first prop trading platform built exclusively for NSE/BSE traders. 
          Trade Nifty, BankNifty & F&O with virtual capital. Pass the challenge, 
          get funded, earn real payouts in INR.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link 
            to="/register" 
            className="bg-green-400 text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-green-300 transition-all transform hover:scale-105 w-full sm:w-auto"
          >
            Start Challenge — From ₹999
          </Link>
          <a 
            href="#how-it-works"
            className="border border-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:border-gray-500 transition-all w-full sm:w-auto"
          >
            How It Works →
          </a>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border border-gray-800 rounded-2xl p-6 bg-gray-900/50">
          <div>
            <p className="text-2xl md:text-3xl font-black text-green-400">₹20L</p>
            <p className="text-gray-500 text-sm mt-1">Max Account Size</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-green-400">80%</p>
            <p className="text-gray-500 text-sm mt-1">Profit Split</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-green-400">₹999</p>
            <p className="text-gray-500 text-sm mt-1">Starting From</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-green-400">INR</p>
            <p className="text-gray-500 text-sm mt-1">100% INR Payouts</p>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero