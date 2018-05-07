# Serverless Deals
A sample project showing off using graphQL-yoga with serverless and dynamoDB. 

This app also features Auth0 integration through the context parameter passed into each resolver. 
The authenticator will attempt to parse and authenticate a token located in the "Authorization" header and it expects the format "Bearer token" for the field.
If you'd like to add the Auth0 integration, you have to add the code from the extras folder as a new rule in the Auth0 dashboard.

All the models in the database store records into a single Content database. 
The dynamoDB has a hash key which is the type of document being stored and a range key which is the unique id of the record.

There are two models in this example, deals which have many contracts. 
When we create a contract we pass in a parameter "deal" which is the id of the deal that it belongs to.
When the contract is inserted, it will prepend the deal id before the new uuid created and we separate each level of hierarchy with a # symbol.

Organizing the collection storing like this is adventageous because dynamoDB is an organized database so you can do things like query the contracts database with type contract and begins with id of the deal it belongs to.
This makes finding all the contracts that belong to a deal super fast.


