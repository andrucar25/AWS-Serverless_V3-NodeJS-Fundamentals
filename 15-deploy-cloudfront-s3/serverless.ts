import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'deploycloudfront',
  frameworkVersion: '3',
  plugins: ['serverless-s3-sync'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'us-east-1',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              's3:*',
              'cloudfront:*',
              'cloudformation:*',
              'iam:PassRole'
            ],
            Resource: '*'
          }
        ]
      }
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    bucketName: "angular-deploy-bucket-2025-test",
    s3Sync: [
      {
        bucketName: "${self:custom.bucketName}",
        localDir: "dist/app-cognito/browser",
        acl: 'private'
      },
    ],
  },
  resources: {
    Resources: {
      DeployAngularBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:custom.bucketName}",
          AccessControl: "Private",
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            IgnorePublicAcls: true,
            BlockPublicPolicy: true,
            RestrictPublicBuckets: true
          },
          OwnershipControls: {
            Rules: [
              {
                ObjectOwnership: "ObjectWriter",
              },
            ],
          },
        },
      },

      CloudFrontOriginAccessIdentity: {
        Type: "AWS::CloudFront::CloudFrontOriginAccessIdentity",
        Properties: {
          CloudFrontOriginAccessIdentityConfig: {
            Comment: "OAI for Angular app bucket"
          }
        }
      },

      S3AccessPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: "${self:custom.bucketName}",
          PolicyDocument: {
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  CanonicalUser: { 
                    "Fn::GetAtt": ["CloudFrontOriginAccessIdentity", "S3CanonicalUserId"] 
                  }
                },
                Action: [
                  "s3:GetObject",
                  "s3:ListBucket"
                ],
                Resource: [
                  {
                    "Fn::Join": [
                      "",
                      ["arn:aws:s3:::", "${self:custom.bucketName}"]
                    ]
                  },
                  {
                    "Fn::Join": [
                      "",
                      ["arn:aws:s3:::", "${self:custom.bucketName}", "/*"]
                    ]
                  }
                ]
              }
            ]
          }
        }
      },

      CloudFrontDistribution: {
        Type: "AWS::CloudFront::Distribution",
        Properties: {
          DistributionConfig: {
            Origins: [
              {
                DomainName: {
                  "Fn::GetAtt": ["DeployAngularBucket", "RegionalDomainName"],
                },
                Id: "S3Origin",
                S3OriginConfig: {
                  OriginAccessIdentity: {
                    "Fn::Join": ["", [
                      "origin-access-identity/cloudfront/",
                      { Ref: "CloudFrontOriginAccessIdentity" }
                    ]]
                  }
                }
              },
            ],
            Enabled: true,
            DefaultRootObject: "index.html",
            HttpVersion: "http2",
            CustomErrorResponses: [
              {
                ErrorCode: 403,
                ResponseCode: 200,
                ResponsePagePath: "/index.html",
              },
              {
                ErrorCode: 404,
                ResponseCode: 200,
                ResponsePagePath: "/index.html",
              },
            ],
            DefaultCacheBehavior: {
              TargetOriginId: "S3Origin",
              ViewerProtocolPolicy: "redirect-to-https",
              AllowedMethods: ["GET", "HEAD", "OPTIONS"],
              CachedMethods: ["GET", "HEAD", "OPTIONS"],
              ForwardedValues: {
                QueryString: false,
                Cookies: {
                  Forward: "none",
                },
                Headers: ["Origin"]
              },
              MinTTL: 0,
              DefaultTTL: 3600,
              MaxTTL: 86400,
              Compress: true
            },
            ViewerCertificate: {
              CloudFrontDefaultCertificate: true,
            },
          },
        },
      },
    },
    Outputs: {
      CloudFrontURL: {
        Value: {
          "Fn::GetAtt": ["CloudFrontDistribution", "DomainName"]
        },
        Description: "URL de distribución de CloudFront"
      }
    }
  }
};

module.exports = serverlessConfiguration;