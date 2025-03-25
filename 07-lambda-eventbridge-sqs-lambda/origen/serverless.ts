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
            Action: ["events:PutEvents"],
            Resource: "*",
          },
        ],
      },
    }
  },
  resources: {
    Resources: {
      SQSClient: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "origen-queue-eventbridge",
        },
      },
      EventBusEB: {
        Type: "AWS::Events::EventBus",
        Properties: {
          Name: "origen-event-bus",
        },
      },
      EventRuleEB: {
        Type: "AWS::Events::Rule",
        Properties: {
          EventBusName: {
            "Fn::GetAtt": ["EventBusEB", "Name"],
          },
          EventPattern: {
            source: ["appointment-medic"],
            "detail-type": ["appointment-scheduled"],
          },
          Targets: [
            {
              Arn: {
                "Fn::GetAtt": ["SQSClient", "Arn"],
              },
              Id: "SQSClient",
            },
          ],
        },
      },
      EventBridgePermissions: {
        Type: "AWS::SQS::QueuePolicy",
        Properties: {
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: "*",
                Action: "sqs:SendMessage",
                Resource: {
                  "Fn::GetAtt": ["SQSClient", "Arn"],
                },
                Condition: {
                  ArnEquals: {
                    "aws:SourceArn": {
                      "Fn::GetAtt": ["EventRuleEB", "Arn"],
                    },
                  },
                },
              },
            ],
          },
          Queues: [
            {
              Ref: "SQSClient",
            },
          ],
        },
      },

    }
  },
  // import the function via paths
  functions: { execute },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: [
        '@aws-sdk/client-eventbridge', 
        '@aws-sdk/client-sqs',         
        '@aws-sdk/protocol-http',      
        '@aws-sdk/smithy-client'
      ],  
      // exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      external: ['@aws-sdk/*'],
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
