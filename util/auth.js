import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

const jwks = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI
});

export const verifyToken = idToken =>
  new Promise((resolve, reject) => {
    try {
      const { header, payload } = jwt.decode(idToken, { complete: true });
      if (!header || !header.kid || !payload) {
        reject(new Error('Invalid token.'));
      }
      jwks.getSigningKey(header.kid, (fetchError, key) => {
        if (fetchError) {
          reject(new Error(`Error getting signing key: ${fetchError.message}`));
        }
        return jwt.verify(
          idToken,
          key.publicKey,
          { algorithms: ['RS256'] },
          (verificationError, decoded) => {
            if (verificationError) {
              reject(new Error(`Verification error: ${verificationError.message}`));
            }
            resolve(decoded);
          }
        );
      });
    } catch (e) {
      reject(new Error('Bad Token'));
    }
  }).catch(error =>
    // console.log(error); //You might need to add logic here to detect if there is no token or a bad token
    // bad /old tokens should throw an error while no token should be allowed in
    ({}));

export const formatAuth0User = auth0User => {
  if (_.isEmpty(auth0User)) {
    return {};
  }
  return {
    role: auth0User['https://www.example.com/userType'],
    id: auth0User.sub
  };
};

export const authenticate = async idToken => {
  const auth0User = await verifyToken(idToken);
  return formatAuth0User(auth0User);
};
