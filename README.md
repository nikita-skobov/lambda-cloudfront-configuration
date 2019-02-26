# lambda-cloudfront-configuration

## About
This repository is a serverless configuration that sets up a lambda function, a cloudfront distribution with the lambda function as the origin, and a route 53 record to resolve a domain name to point to the cloudfront distribution. For many websites, you would use a combination of Route53 > CloudFront > S3 to host the websites, however, some websites require dynamic content rendered by the server. For these types of websites, the configuration in this repository might be a better choice.

## Pre-requisites
Before using this repository, you must have:
- [serverless installed](https://serverless.com/framework/docs/providers/aws/guide/quick-start/)
- An AWS account with proper credentials to be able to deploy cloudformation templates, and resources.
- You must either have your credentials stored in the default .aws/credentials file, or otherwise passed in to your serverless deploy command so that the serverless framework can create resources on behalf of your account. See [this article for examples of how to set up your credentials to work with serverless](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- A domain with a hosted zone in Route53
- An SSL certificate for that domain in ACM

## Set up

```sh
git clone https://github.com/nikita-skobov/lambda-cloudfront-configuration.git
cd lambda-cloudfront-configuration
```

This serverless configuration creates a cloudfront distribution, which can take up to 40 minutes. This configuration also sets up an api-key to use with your lambda function which prevents anyone from making requests directly to your lambda function (ie: they must connect through CloudFront). So you must tell CloudFront to use a custom header: x-api-key. Serverless will create this api key for you automatically, but unfortunately, there is no way to reference the value of this key. So an alternative is to do the following:

1. Comment out the resources block within serverless.yml This will prevent the cloudfront distribution from being created.
```yml
# resources:
#   Resources: ${file(./serverlessConfig/resources.yml):Resources}
```
2. Deploy once to set up the function, and the api key.
```sh
sls deploy # provide any command line options you want such as changing the service name, region, etc.
# An example:
# sls deploy --service my-service --region eu-west-1  --etc...
```
When step 2 is done, you will get an output similar to:
```yml
Service Information
service: lambda-cloudfront-configuration
stage: staging
region: us-east-1
stack: lambda-cloudfront-configuration-staging
api keys:
  lambda-cloudfront-configuration-staging: NR6Kc5Swf12qyBOABvliN2fCHozuhtGI1InPTRd6
endpoints:
  GET - https://mnv1ii55s5.execute-api.us-east-1.amazonaws.com/staging/
functions:
  root: lambda-cloudfront-configuration-staging-root
layers:
  None
```
3. Next, go back to the serverless.yml file, and uncomment the resources block.
4. Find your certificate ID from ACM. The certificate ID is the UUID that comes after the / in the ACM ARN.
```sh
# An ARN might look something like:
arn:aws:acm:us-east-1:210375816012:certificate/00925a3a-1d59-46b8-ad34-4c36b1256064
# so the certificate ID is:
00925a3a-1d59-46b8-ad34-4c36b1256064
```
5. Redeploy, but make sure to provide the necessary options for the cloudfront distribution. You can see these within the custom section of the serverless.yml file:
```yml
custom:
  # policies: ${file(./serverlessConfig/policies.yml):policies}
  api-distribution:
    origin-path: "/${self:provider.stage}"
    certid: ${opt:certid}
    hostedzonename: ${opt:hzname} #eg: mywebsite.com
    alias: ${opt:alias} #eg: mywebsite.com OR something.mywebsite.com
    api-key-value: ${opt:api-key-value}
    error-cache-ttl: 2
    # logbucket: "${opt:logbucket}.s3.amazonaws.com"
    # logbucket-prefix: "${self:custom.api-distribution.alias}-${self:provider.stage}"
```

An example deployment command might look like:
```sh
sls deploy --certid 00925a3a-1d59-46b8-ad34-4c36b1256064 --hzname mywebsite.com --alias mywebsite.com --api-key-value NR6Kc5Swf12qyBOABvliN2fCHozuhtGI1InPTRd6
```

## What's next?

This repository offers a starting point for setting up a website that gets rendered on the server side. The placeholder implementation located in handlers/root.js is an example implementation that simply returns an html string. There are many ways to return rendered html such as react, emberJS, vueJS, pug, etc etc.