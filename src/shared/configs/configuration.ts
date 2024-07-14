export default (): any => ({
  env: process.env.APP_ENV,
  port: process.env.APP_PORT,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
  },
  jwt: {
    publicKey: Buffer.from(
      process.env.JWT_PUBLIC_KEY_BASE64!,
      'base64',
    ).toString('utf8'),
    privateKey: Buffer.from(
      process.env.JWT_PRIVATE_KEY_BASE64!,
      'base64',
    ).toString('utf8'),
    accessTokenExpiresInSec: parseInt(
      process.env.JWT_ACCESS_TOKEN_EXP_IN_SEC!,
      10,
    ),
    refreshTokenExpiresInSec: parseInt(
      process.env.JWT_REFRESH_TOKEN_EXP_IN_SEC!,
      10,
    ),
  },
  circle: {
    secret: process.env.CIRCLE_SECRET,
    ciphered: process.env.CIRCLE_CIPHERED,
    sk: process.env.CIRCLE_SK,
    transaction_uri: process.env.CIRCLE_TRANSACTION_URI,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    assistantId: process.env.OPENAI_ASSISTANT_ID,
  },
  bitso: {
    env: process.env.BITSO_ENV,
    apiKey: process.env.BITSO_API_KEY,
    apiSecret: process.env.BITSO_API_SECRET,
    walletAddressId: process.env.BITSO_WALLET_ADDRESS_ID,
  },
});
