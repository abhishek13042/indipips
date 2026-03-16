/**
 * KYC Service
 * Logic for validating and verifying Identity documents (Aadhaar/PAN).
 * Note: Currently implements rigorous regex validation and mock verification logic.
 */

/**
 * Validates Aadhaar Number format (12 digits, doesn't start with 0 or 1 usually)
 * @param {string} aadhaar 
 */
const validateAadhaarFormat = (aadhaar) => {
  const regex = /^[2-9]{1}[0-9]{11}$/;
  return regex.test(aadhaar);
};

/**
 * Validates PAN Number format (5 letters, 4 digits, 1 letter)
 * @param {string} pan 
 */
const validatePanFormat = (pan) => {
  const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return regex.test(pan.toUpperCase());
};

/**
 * Mock verify Aadhaar with an external provider
 */
const verifyAadhaar = async (aadhaar) => {
  if (!validateAadhaarFormat(aadhaar)) {
    throw new Error('Invalid Aadhaar format');
  }
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock success
  return {
    success: true,
    message: 'Aadhaar verified successfully (Mock)',
    data: { aadhaar }
  };
};

/**
 * Mock verify PAN with an external provider
 */
const verifyPan = async (pan) => {
  if (!validatePanFormat(pan)) {
    throw new Error('Invalid PAN format');
  }

  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock success
  return {
    success: true,
    message: 'PAN verified successfully (Mock)',
    data: { pan: pan.toUpperCase() }
  };
};

module.exports = {
  validateAadhaarFormat,
  validatePanFormat,
  verifyAadhaar,
  verifyPan
};
