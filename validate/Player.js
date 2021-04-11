const joi = require('joi');

module.exports = joi.object({
    name: joi
        .string()
        .required(),
    username: joi
        .string()
        .required(),
    email: joi
        .string()
        .email()
        .required(),
    country: joi
        .string()
        .required(),
    phone: joi
        .string()
        .required(),
    password: joi
        .string()
        .min(6)
        .required(),
});
