const Joi = require('joi');

/**
 * Generic Validation Middleware
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ success: false, message: errorMessage });
  }
  next();
};

/**
 * Authentication Schemas
 */
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  password: Joi.string().min(8).required(),
  referralCode: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * Payout Schemas
 */
const payoutRequestSchema = Joi.object({
  challengeId: Joi.string().uuid().required()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  payoutRequestSchema
};
