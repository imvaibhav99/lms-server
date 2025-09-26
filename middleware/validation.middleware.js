//npm i express-validator
// read the documentation and copy the given code
import {body, param, query, validationResult} from "express-validator"

export const validate= (validations)=>{
    return async (req, res, next)=>{
        //run the valdation

        await Promise.all(validations.map(validation.run(req)))

        const errors= validationResult(req)
        if(errors.isEmpty()){
            return next()
        }

        const extractedError= errors.array().map(err=>({
            field: err.path,
            message: err.msg
        }))
        throw new Error("validation error")
    }
}

export const commonValidations = {
    pagination:[
        query('page')
            .optional()
            .isInt({min: 1})
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({min: 1, max: 100})
            .withMessage("limit must be between 1 and 100")
    ],
    email:
        body()
            .isEmail()
            .normalizeEmail()
            .withMessage('Please provide a valid email'),
    name:
        body()
            .trim()
            .isLength({min:2, max: 50})
};

export const  validateSignUp= validate([
    commonValidations.email,
    commonValidations.name
]);




//create many validations like this for each apis