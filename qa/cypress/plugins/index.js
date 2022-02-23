require('dotenv').config()

module.exports = (on, config) => {

  config.env.auth0_username = process.env.AUTH0_USERNAME;
  config.env.auth0_password = process.env.AUTH0_PASSWORD;
  config.env.auth0_domain = process.env.AUTH0_DOMAIN;
  config.env.auth0_audience = process.env.AUTH0_AUDIENCE;
  config.env.auth0_scope = process.env.AUTH0_SCOPE;
  config.env.auth0_client_id = process.env.AUTH0_CLIENTID;

  return config;
}
