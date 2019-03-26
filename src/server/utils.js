/* eslint-disable import/prefer-default-export */

// converts expires_in to an epoch timestamp
export const expiresToTimeStamp = expiresIn => new Date(Date.now() + expiresIn * 1000);

// encodes json object in base64
export const encode = (value, type, strategy) => (
  Buffer.from(JSON.stringify({ value, type, strategy })).toString('base64')
);

/* eslint-enable import/prefer-default-export */
