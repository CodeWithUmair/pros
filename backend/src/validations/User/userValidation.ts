import Joi from "joi";

export const sendFundsSchema = Joi.object({
  recipientEmail: Joi.string().email({ minDomainSegments: 2 }).messages({
    "string.empty": "Email is required.",
    "string.email": "Must be a valid email address.",
  }),

  tokenAddress: Joi.string().required().messages({
    "string.empty": "Token address is required.",
  }),
  amount: Joi.number().required().messages({
    "number.base": "Amount must be a number.",
    "any.required": "Amount is required.",
  }),
  description: Joi.string().required().max(100).messages({
    "string.empty": "Description is required.",
    "string.max": "Description must be at most 100 characters long.",
  }),
})
