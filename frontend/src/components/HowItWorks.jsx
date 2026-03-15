function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Choose Your Plan',
      description: 'Select a challenge plan from ₹999. Pick your account size — from ₹2.5 Lakh to ₹20 Lakh virtual capital.',
      icon: '📋',
    },
    {
      number: '02',
      title: 'Pay & Start Trading',
      description: 'Pay via UPI, Card or Netbanking. Get instant access to your virtual trading account on NSE/BSE.',
      icon: '💳',
    },
    {
      number: '03',
      title: 'Hit the Profit Target',
      description: 'Trade Nifty, BankNifty, F&O. Hit 8% profit target in 45 days while staying within drawdown limits.',
      icon: '📈',
    },
    {
      number: '04',
      title: 'Get Funded & Earn',
      description: 'Pass the challenge? Get a funded account. Keep 80% of all profits. Withdraw directly to your bank via NEFT/IMPS.',
      icon: '🏆',
    },
  ]

  return (
    <section id="how-it-works" className="bg-black py-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            How Indipips Works
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            From registration to funded account in 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-400/50 transition-all">
              
              {/* Arrow connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 text-green-400 text-xl">
                  →
                </div>
              )}

              {/* Step number */}
              <p className="text-green-400/30 font-black text-5xl mb-4">{step.number}</p>
              
              {/* Icon */}
              <p className="text-4xl mb-4">{step.icon}</p>
              
              {/* Content */}
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default HowItWorks