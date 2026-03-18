/**
 * Formats a number to Indian Rupee currency string with Lakhs/Crores conversion.
 * Example: 250000 -> ₹2.5 Lakhs
 * Example: 10000000 -> ₹1.0 Crore
 * 
 * @param {number} amount - The numeric amount to format
 * @param {boolean} short - Whether to use suffixes (Lakhs/Crore)
 */
export const formatRupee = (amount, short = true) => {
  if (!short) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Crore`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${amount}`;
};
