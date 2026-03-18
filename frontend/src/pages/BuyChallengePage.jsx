import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Info, ShieldCheck, CreditCard, Wallet, BadgePercent } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../api'
import { formatRupee } from '../utils/format'
import { 
  challengeTypes, 
  models, 
  accountSizes, 
  tradingRules, 
  platforms, 
  paymentMethods 
} from '../data/ChallengePlans'

function BuyChallengePage() {
  const navigate = useNavigate()
  
  // Selection State
  const [selectedType, setSelectedType] = useState('TWO_STEP')
  const [selectedModel, setSelectedModel] = useState('IND_PIPS')
  const [selectedSize, setSelectedSize] = useState(accountSizes[4]) // ₹1 Crore default
  const [profitTarget, setProfitTarget] = useState('8')
  const [swapFree, setSwapFree] = useState('NO')
  const [selectedPlatform, setSelectedPlatform] = useState('MT5')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  
  // UI State
  const [coupon, setCoupon] = useState('')
  const [termsAgreed, setTermsAgreed] = useState({
    use: false,
    correct: false,
    tcs: false,
    resident: false
  })
  const [loading, setLoading] = useState(false)

  // Calcs
  const totalPrice = useMemo(() => {
    let price = selectedSize.price;
    // Apply swap-free logic
    if (swapFree === 'YES') {
      price = price * 1.1; // +10%
    }
    // Add platform extra
    const plat = platforms.find(p => p.id === selectedPlatform);
    if (plat) price += plat.extra;

    return price;
  }, [selectedSize, swapFree, selectedPlatform])

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const payload = {
        challengeType: selectedType,
        model: selectedModel,
        accountSize: selectedSize.numericValue,
        profitTarget,
        swapFree: swapFree === 'YES',
        platform: selectedPlatform,
        paymentMethod,
        coupon
      };
      
      const res = await api.post('/payments/create-checkout', payload)
      if (res.data?.data?.url) {
        window.location.href = res.data.data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Checkout failed. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const allTermsChecked = Object.values(termsAgreed).every(v => v === true)

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-20">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center">
              <div className="w-5 h-5 bg-black text-white rounded flex flex-col items-center justify-center text-[10px] font-black leading-none">IP</div>
           </div>
           <span className="text-slate-400 font-medium">IndiPips®</span>
           <span className="text-slate-200">|</span>
           <h1 className="text-3xl font-bold text-slate-900">New Challenge</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Selection Area (Step 2 & 3) */}
          <div className="flex-1 space-y-8 w-full">
            
            {/* Challenge Type */}
            <section>
               <h3 className="text-sm font-bold text-slate-900 mb-1">Challenge Type</h3>
               <p className="text-xs text-slate-500 mb-4">Choose the type of challenge you want to take</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {challengeTypes.map(type => (
                    <button 
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-left ${
                         selectedType === type.id 
                         ? 'border-[#3b66f5] bg-blue-50/30' 
                         : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedType === type.id ? 'border-[#3b66f5]' : 'border-slate-300'}`}>
                          {selectedType === type.id && <div className="w-2.5 h-2.5 rounded-full bg-[#3b66f5]" />}
                       </div>
                       <span className={`font-bold ${selectedType === type.id ? 'text-slate-900' : 'text-slate-600'}`}>
                         {type.label}
                       </span>
                    </button>
                  ))}
               </div>
            </section>

            {/* Model */}
            <section>
               <h3 className="text-sm font-bold text-slate-900 mb-1">Model</h3>
               <p className="text-xs text-slate-500 mb-4">Choose the trading model</p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all text-left group ${
                         selectedModel === m.id 
                         ? 'border-[#3b66f5] bg-blue-50/30' 
                         : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedModel === m.id ? 'border-[#3b66f5]' : 'border-slate-300'}`}>
                          {selectedModel === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#3b66f5]" />}
                       </div>
                       <div>
                          <p className={`font-bold ${selectedModel === m.id ? 'text-slate-900' : 'text-slate-600'}`}>{m.label}</p>
                          <p className="text-[11px] text-slate-500">{m.desc}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </section>

            {/* Customise Trading Rules */}
            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BadgePercent className="text-blue-500" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Customise Trading Rules</h3>
                    <p className="text-[11px] text-slate-500">Adjust your challenge parameters to match your trading style</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profit Target */}
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-3">Profit Target</p>
                    <p className="text-[10px] text-slate-500 mb-3">Choose options for profit target</p>
                    <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200">
                       {tradingRules.profitTarget.map(rule => (
                         <button 
                           key={rule.id}
                           onClick={() => setProfitTarget(rule.id)}
                           className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex justify-between items-center ${
                             profitTarget === rule.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                           }`}
                         >
                            <span>{rule.label}</span>
                            <span className={`text-[9px] ${rule.price === 0 ? 'text-slate-400 font-normal' : 'text-blue-600'}`}>
                               {rule.price === 0 ? 'Default' : formatRupee(rule.price)}
                            </span>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Swap Free */}
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-3">Swap Free</p>
                    <p className="text-[10px] text-slate-500 mb-3">Choose options for swap free</p>
                    <div className="flex gap-2 p-1 bg-white rounded-lg border border-slate-200">
                       {tradingRules.swapFree.map(rule => (
                         <button 
                           key={rule.id}
                           onClick={() => setSwapFree(rule.id)}
                           className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex justify-between items-center ${
                             swapFree === rule.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                           }`}
                         >
                            <span>{rule.label}</span>
                            <span className={`text-[9px] ${rule.price === 0 ? 'text-slate-400 font-normal' : 'text-blue-600'}`}>
                               {rule.price === 0 ? 'Default' : rule.labelExtra || formatRupee(rule.price)}
                            </span>
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </section>

            {/* Account Size */}
            <section>
               <h3 className="text-sm font-bold text-slate-900 mb-1">Account Size</h3>
               <p className="text-xs text-slate-500 mb-4">Choose your preferred account size</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {accountSizes.map(size => (
                    <button 
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-left ${
                         selectedSize.id === size.id 
                         ? 'border-[#3b66f5] bg-blue-50/30' 
                         : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedSize.id === size.id ? 'border-[#3b66f5]' : 'border-slate-300'}`}>
                          {selectedSize.id === size.id && <div className="w-2.5 h-2.5 rounded-full bg-[#3b66f5]" />}
                       </div>
                       <span className={`font-bold whitespace-nowrap ${selectedSize.id === size.id ? 'text-slate-900' : 'text-slate-600'}`}>
                         {size.label}
                       </span>
                    </button>
                  ))}
               </div>
            </section>

            {/* Trading Platform */}
            <section>
               <h3 className="text-sm font-bold text-slate-900 mb-1">Trading Platform</h3>
               <p className="text-xs text-slate-500 mb-4">Choose your preferred trading platform</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {platforms.map(plat => (
                    <button 
                      key={plat.id}
                      onClick={() => setSelectedPlatform(plat.id)}
                      className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all text-left ${
                         selectedPlatform === plat.id 
                         ? 'border-[#3b66f5] bg-blue-50/30' 
                         : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedPlatform === plat.id ? 'border-[#3b66f5]' : 'border-slate-300'}`}>
                          {selectedPlatform === plat.id && <div className="w-2.5 h-2.5 rounded-full bg-[#3b66f5]" />}
                       </div>
                       <div className="flex-1 flex justify-between items-center">
                          <span className={`font-bold ${selectedPlatform === plat.id ? 'text-slate-900' : 'text-slate-600'}`}>
                           {plat.label}
                          </span>
                          {plat.extra > 0 && <span className="text-[9px] text-blue-600 font-bold">+{formatRupee(plat.extra)}</span>}
                       </div>
                    </button>
                  ))}
               </div>
            </section>

          </div>

          {/* RIGHT: Order Summary (Step 4) */}
          <div className="w-full lg:w-[400px] lg:sticky lg:top-10 space-y-6">
             
             {/* Billing Details Accordion Placeholder */}
             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex justify-between items-center text-slate-900 mb-0">
                  <h3 className="text-sm font-bold">Billing Details</h3>
                  <ChevronRight size={18} className="text-slate-400 rotate-90" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Enter your billing information for the challenge purchase</p>
             </div>

             {/* Coupon */}
             <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Coupon Code</h3>
                <p className="text-[11px] text-slate-500">Enter a coupon code to get a discount on your challenge</p>
                <div className="flex gap-2">
                   <input 
                      type="text" 
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   />
                   <button className="px-5 py-2.5 bg-slate-50 text-slate-400 font-bold text-xs rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">Apply</button>
                </div>
             </div>

             {/* Summary Card */}
             <div className="bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-white border-b border-slate-100 p-5">
                   <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
                </div>
                
                <div className="p-5 space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedSize.displayValue} — {challengeTypes.find(t => t.id === selectedType)?.label} {models.find(m => m.id === selectedModel)?.label}</p>
                        <p className="text-[11px] text-slate-500">Platform: {selectedPlatform}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{formatRupee(selectedSize.price)}</span>
                   </div>

                   {swapFree === 'YES' && (
                     <div className="flex justify-between items-center text-[11px] text-blue-600 font-bold">
                        <span>Swap Free Option (+10%)</span>
                        <span>{formatRupee(selectedSize.price * 0.1)}</span>
                     </div>
                   )}

                   <div className="h-px bg-slate-100 my-2"></div>

                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-900">{formatRupee(totalPrice)}</span>
                   </div>

                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">GST (18%)</span>
                      <span className="font-bold text-slate-900">{formatRupee(totalPrice * 0.18)}</span>
                   </div>

                   <div className="h-px bg-slate-200 my-2"></div>

                   <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-slate-900">Total Amount</span>
                      <span className="text-2xl font-black text-[#3b66f5]">{formatRupee(totalPrice * 1.18)}</span>
                   </div>

                   {/* Terms Checkboxes */}
                   <div className="space-y-3 pt-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" checked={termsAgreed.all} onChange={() => setTermsAgreed(prev => ({...prev, use: !prev.use, correct: !prev.correct, tcs: !prev.tcs, resident: !prev.resident}))} className="hidden" />
                        <div onClick={() => setTermsAgreed(p => ({...p, use: !p.use}))} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${termsAgreed.use ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                           {termsAgreed.use && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[11px] leading-relaxed text-slate-600">I have read and agreed to the <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>.</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div onClick={() => setTermsAgreed(p => ({...p, correct: !p.correct}))} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${termsAgreed.correct ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                           {termsAgreed.correct && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[11px] leading-relaxed text-slate-600">All information provided is correct and matches government-issued ID.</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div onClick={() => setTermsAgreed(p => ({...p, tcs: !p.tcs}))} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${termsAgreed.tcs ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                           {termsAgreed.tcs && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[11px] leading-relaxed text-slate-600">I have read and agree with the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>.</span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div onClick={() => setTermsAgreed(p => ({...p, resident: !p.resident}))} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${termsAgreed.resident ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                           {termsAgreed.resident && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[11px] leading-relaxed text-slate-600">I confirm that I am not a U.S. citizen or resident.</span>
                      </label>
                   </div>
                </div>
             </div>

             {/* Payment Methods */}
             <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Select payment method</h3>
                <div className="space-y-2">
                   {paymentMethods.map(method => (
                     <button 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === method.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === method.id ? 'border-blue-600' : 'border-slate-300'}`}>
                              {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                           </div>
                           <span className="text-xs font-bold text-slate-900">{method.label}</span>
                        </div>
                        <div className="flex gap-2">
                           {method.icons.map(icon => (
                             <div key={icon} className="h-5 w-8 bg-slate-100 rounded flex items-center justify-center text-[8px] font-black text-slate-400">
                                {icon}
                             </div>
                           ))}
                        </div>
                     </button>
                   ))}
                </div>
             </div>

             <button 
                onClick={handlePurchase}
                disabled={!allTermsChecked || loading}
                className={`w-full py-4 rounded-xl font-black text-sm tracking-wider transition-all shadow-lg ${
                  allTermsChecked && !loading
                  ? 'bg-[#3b66f5] text-white hover:bg-blue-600 hover:-translate-y-0.5' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
             >
                {loading ? 'PROCESSING...' : 'CONTINUE TO PAYMENT'}
             </button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}

export default BuyChallengePage

