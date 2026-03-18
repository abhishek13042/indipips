export const challengeTypes = [
  { id: 'ONE_STEP', label: 'One Step', icon: '🎯' },
  { id: 'TWO_STEP', label: 'Two Step', icon: '🏆' },
  { id: 'ZERO', label: 'Zero', icon: '⚡' },
];

export const models = [
  { id: 'IND_PIPS', label: 'IndiPips', desc: 'Highest drawdown allowance' },
  { id: 'IND_PIPS_PRO', label: 'IndiPips Pro', desc: 'Weekly or daily payouts' },
];

export const accountSizes = [
  { id: '5L', label: '₹5.0 Lakhs', value: 5000, displayValue: '₹5.0 Lakhs', numericValue: 500000, price: 4150 },
  { id: '10L', label: '₹10.0 Lakhs', value: 10000, displayValue: '₹10.0 Lakhs', numericValue: 1000000, price: 8300 },
  { id: '25L', label: '₹25.0 Lakhs', value: 25000, displayValue: '₹25.0 Lakhs', numericValue: 2500000, price: 20750 },
  { id: '50L', label: '₹50.0 Lakhs', value: 50000, displayValue: '₹50.0 Lakhs', numericValue: 5000000, price: 41500 },
  { id: '1C', label: '₹1.0 Crore', value: 100000, displayValue: '₹1.0 Crore', numericValue: 10000000, price: 83000 },
];

export const platforms = [
  { id: 'MT5', label: 'MetaTrader 5', extra: 0 },
  { id: 'MatchTrader', label: 'MatchTrader', extra: 0 },
  { id: 'cTrader', label: 'cTrader', extra: 1600 },
];

export const tradingRules = {
  profitTarget: [
    { id: '8', label: '8%', price: 0, default: true },
    { id: '10', label: '10%', price: -3300 }, // Discount for higher target? Or maybe different rule
  ],
  swapFree: [
    { id: 'NO', label: 'No', price: 0, default: true },
    { id: 'YES', label: 'Yes', price: 0.1, labelExtra: '+10% (MT5 only)' }, // +10% fee
  ]
};

export const paymentMethods = [
  { id: 'CARD', label: 'Credit / Debit Card', icons: ['VISA', 'MASTERCARD'] },
  { id: 'CRYPTO', label: 'Crypto', icons: ['BITCOIN'] },
  { id: 'ASTROPAY', label: 'AstroPay', icons: ['ASTROPAY'] },
  { id: 'PAYPAL', label: 'PayPal', icons: ['PAYPAL'] },
  { id: 'NETELLER', label: 'Neteller (+4%)', icons: ['NETELLER'] },
  { id: 'PAYSAFECARD', label: 'Paysafecard (+10%)', icons: ['PAYSAFECARD'] },
  { id: 'SKRILL', label: 'Skrill (+4%)', icons: ['SKRILL'] },
];
