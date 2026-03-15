function WhyUs() {
  const reasons = [
    {
      icon: '🏆',
      title: 'Built for India',
      description: 'Trade Nifty, BankNifty, MidcapNifty, F&O — instruments you already know. No USD, no foreign platforms.',
    },
    {
      icon: '💰',
      title: '100% INR Payouts',
      description: 'Get paid directly to your Indian bank account via NEFT/IMPS. No Wise, no Payoneer, no conversion fees.',
    },
    {
      icon: '⚡',
      title: 'Instant UPI Payments',
      description: 'Pay your challenge fee via UPI, Card or Netbanking. Get account access within minutes of payment.',
    },
    {
      icon: '🤖',
      title: 'Algo Trading Allowed',
      description: 'Use your automated trading strategies freely. Most global prop firms ban algos — we welcome them.',
    },
    {
      icon: '🛡️',
      title: 'Transparent Rules',
      description: '8% profit target, 4% daily loss limit, 8% max drawdown. Simple, fair, and clearly defined rules.',
    },
    {
      icon: '📊',
      title: 'Real-Time Dashboard',
      description: 'Track your P&L, drawdown, and rule compliance live. No surprises — always know exactly where you stand.',
    },
  ]

  return (
    <section id="why-us" className="bg-gray-950 py-24 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Why Indipips?</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            The only prop firm built exclusively for Indian traders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-400/50 transition-all group">
              <div className="text-4xl mb-4">{reason.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-green-400 transition-colors">
                {reason.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gray-900 border border-gray-800 rounded-2xl p-10">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
            Ready to prove your trading skills?
          </h3>
          <p className="text-gray-400 mb-6">Join hundreds of Indian traders already on the waitlist</p>
          <a href="#plans" className="inline-block bg-green-400 text-black px-8 py-4 rounded-xl font-black text-lg hover:bg-green-300 transition-all">
            View Challenge Plans →
          </a>
        </div>

      </div>
    </section>
  )
}

export default WhyUs