import Joi from "joi";

// const userSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
//     confirmPassword: Joi.string().required(),
//     username: Joi.string().required(),
//     phone: Joi.string().required(),
//     age: Joi.number().required(),
// })

const schema = {
  body: Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  query: Joi.object({
    id: Joi.string().required(),
  }),
  // params:Joi.object({

  // })
};
export const validationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    req.body = value;
    next();
  };
};

// const validationMiddleware = (schema) => {
//     return (req,res,next) => {
//         const {error,value} = schema.validate(req.body);
//         if(error){
//             return res.status(400).json({message:error.details[0].message});
//         }
//         req.body = value;
//         next();
//     }
// }
