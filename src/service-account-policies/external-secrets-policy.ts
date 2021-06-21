export const externalSecretsPolicy = (secretsArns?: string[], parametersArns?: string[]) => ({
  'Version': '2012-10-17',
  'Statement': [
    {
      'Effect': 'Allow',
      'Action': [
        'secretsmanager:GetResourcePolicy',
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
        'secretsmanager:ListSecretVersionIds'
      ],
      'Resource': [...(secretsArns || ['*'])]
    },
    {
      'Effect': 'Allow',
      'Action': 'ssm:GetParameter',
      'Resource': [...(parametersArns || ['*'])]
    }
  ]
});
