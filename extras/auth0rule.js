// Just copy this code as a new rule into auth9 and user profile items will be added to your jwt
// The fields you define here need to be formatted like an URL but they don't correspond to anything real
// they will show up just like that in the jwt user object though so just be consistent

function (user, context, callback) {

  if('type' in user.app_metadata) {
    context.accessToken['https://www.example.com/userType']=user.app_metadata.type || "FREE";
  }

  callback(null, user, context);
}
