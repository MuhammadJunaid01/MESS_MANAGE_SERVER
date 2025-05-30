"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../errors");
// Zod validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const messages = err.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw new errors_1.AppError(`Validation failed: ${messages}`, 400, "VALIDATION_ERROR");
            }
            next(err);
        }
    };
};
exports.validate = validate;
