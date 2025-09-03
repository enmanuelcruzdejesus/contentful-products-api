import 'dotenv/config';
import * as Joi from 'joi';

console.log(process.env)


export default () => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'test', 'production')
      .required(),
    PORT: Joi.number().default(3000),
    GLOBAL_PREFIX: Joi.string().default('api'),

    // ADMIN_EMAIL: Joi.string().email().required(),
    // ADMIN_PASSWORD: Joi.string().min(6).required(),
    JWT_SECRET: Joi.string().min(10).required(),
    JWT_EXPIRES_IN: Joi.string().default('1h'),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),

    CONTENTFUL_SPACE_ID: Joi.string().required(),
    CONTENTFUL_ACCESS_TOKEN: Joi.string().required(),
    CONTENTFUL_ENVIRONMENT: Joi.string().required(),
    CONTENTFUL_CONTENT_TYPE: Joi.string().required(),
    CONTENTFUL_PAGE_SIZE: Joi.number().default(100),

    SYNC_CRON: Joi.string().default('0 * * * *'),
  }).unknown(true);

  const { error, value } = schema.validate(process.env, { abortEarly: false });
  if (error) throw new Error(`Config validation error: ${error.message}`);
  return value;
};
