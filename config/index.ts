export const ENV = process.env.TEST_ENV || 'dev';

type EnvConfig = {
  BASE_URL: string;
  HEADLESS: boolean;
  RETRIES: number;
};

const envs: Record<string, EnvConfig> = {
  dev: { BASE_URL: 'https://rahulshettyacademy.com/seleniumPractise/#/', HEADLESS: true, RETRIES: 0 },
  qa: { BASE_URL: 'https://rahulshettyacademy.com/seleniumPractise/#/', HEADLESS: true, RETRIES: 1 },
  staging: { BASE_URL: 'https://rahulshettyacademy.com/seleniumPractise/#/', HEADLESS: true, RETRIES: 1 },
  prod: { BASE_URL: 'https://rahulshettyacademy.com/seleniumPractise/#/', HEADLESS: true, RETRIES: 2 },
};

const CONFIG = envs[ENV] || envs.dev;

export default CONFIG;
