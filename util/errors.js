import _ from 'lodash';

const errorTypes = [
  {
    code: '401',
    message: 'The provided credentials are invalid',
    name: 'WrongCredentialsError'
  }
];

const generateError = (message, name) => ({
  message,
  name,
  time_thrown: new Date()
});

const formatError = output => {
  const errors = _.compact(errorTypes.map(e => (output.body.includes(e.code) ? generateError(e.message, e.name) : null)));

  if (errors.length > 0) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/javascript' },
      body: JSON.stringify({ data: {}, errors })
    };
  }

  return output;
};

export default formatError;
