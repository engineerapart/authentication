/* eslint-disable import/prefer-default-export */

// converts expires_in to an epoch timestamp
export const expiresToTimeStamp = expiresIn => new Date(Date.now() + expiresIn * 1000);

/* eslint-enable import/prefer-default-export */
