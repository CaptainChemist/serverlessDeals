const graphQLError = ({ context, message }) =>
  context.callback(null, {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {}, errors: [{ message }] })
  });

export default graphQLError;
