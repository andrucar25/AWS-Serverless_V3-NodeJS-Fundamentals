import type { AWS } from '@serverless/typescript';

import execute from '@functions/execute';

const serverlessConfiguration: AWS = {
  service: 'origen',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: ["s3:PutBucketNotification", "s3:GetBucketNotification"],
            Resource: "arn:aws:s3:::bucket-event-s3-lambda/*",
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { execute },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['@aws-sdk/client-s3'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      // external: ['@aws-sdk/client-s3']
    },
  },
};

module.exports = serverlessConfiguration;
