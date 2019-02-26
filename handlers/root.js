// eslint-disable-next-line
'use strict';

module.exports.handler = async (event, context) => {
  let statusCode = 500
  let body = { error: 'Unable to issue signature' }
  let headers = {
    'Content-Type': 'application/json',
    // USE one of the following for CORS. either a specific domain, or all domains
    // 'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    // 'Access-Control-Allow-Origin': `https://${process.env.DOMAIN}.com`, // Required for CORS support to work

    // USE the following if you have a private API that needs an authorization header
    // 'Access-Control-Allow-Credentials': true, // Required for authorization headers with HTTPS

    // cache as needed, or otherwise comment this, and use CloudFronts default cache time
    'Cache-Control': 'max-age=20',
  }

  try {
    // TODO: implement your own code

    statusCode = 200
    body = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    </head>
    <body>
    <h1>Test</h1>
    <p>Server time: ${new Date()}</p>
    </body>
    </html>
    `
    headers['Content-Type'] = 'text/html'
  } catch (e) {
    console.log(e)
    headers = e.headers || headers
    statusCode = e.statusCode || statusCode
    body = e.body || body
  }

  return {
    // if there was an error, and we return application/json, make sure to stringify
    // otherwise just return the body as is.
    body: headers['Content-Type'] === 'application/json' ? JSON.stringify(body) : body,
    statusCode,
    headers,
  }
}
