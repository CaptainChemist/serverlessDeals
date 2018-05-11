import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI
});

export const verifyToken = (idToken, context) =>
  new Promise((resolve, reject) => {
    try {
      console.log('context');
      console.log(context);
      if (_.isUndefined(idToken)) {
        return resolve({});
      }

      const parsedToken = idToken.split(' ')[1];
      if (parsedToken === '') {
        return resolve({});
      }
      const { header, payload } = jwt.decode(parsedToken, { complete: true });

      if (!header || !header.kid || !payload) {
        reject('Invalid token.');
      }
      jwks.getSigningKey(header.kid, (fetchError, key) => {
        if (fetchError) {
          reject('Unauthorized');
        }

        return jwt.verify(
          parsedToken,
          key.publicKey,
          { algorithms: ['RS256'] },
          (verificationError, decoded) => {
            if (verificationError) {
              reject('Verification error')
            }
            resolve(decoded);
          }
        );
      });
    } catch (e) {
      reject('Bad Token');
    }
  });

export const formatAuth0User = auth0User => {
  if (_.isEmpty(auth0User)) {
    return {};
  }
  return {
    role: auth0User['https://www.example.com/userType'],
    id: auth0User.sub,
  };
};

export const authenticate = (idToken, context) =>
  verifyToken(idToken, context)
    .then(auth0User => formatAuth0User(auth0User))
