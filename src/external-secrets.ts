import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {ServiceAccountWithPolicy} from './service-account-with-policy';
import {externalSecretsPolicy} from './service-account-policies/external-secrets-policy';

export interface ExtenalSecretsProps {
  cluster: ICluster;
}

export class ExternalSecrets extends Construct {

  constructor(scope: Construct, id: string, props: ExtenalSecretsProps) {
    super(scope, id);

    const serviceAccount = new ServiceAccountWithPolicy(this, 'ExternalSecrets', {
      cluster: props.cluster,
      jsonPolicy: externalSecretsPolicy(),
      serviceAccountName: 'external-secrets',
      serviceAccountNamespace: 'kube-system'
    });

    props.cluster.addHelmChart('ExternalSecretsHelmChart', {
      release: 'external-secrets',
      namespace: 'kube-system',
      repository: 'https://external-secrets.github.io/kubernetes-external-secrets',
      chart: 'kubernetes-external-secrets',
      values: {
        env: {
          AWS_REGION: 'us-east-1',
          POLLER_INTERVAL_MILLISECONDS: '7200000' // 2 hours
        },
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccount.serviceAccountName
        }
      }

    }).node.addDependency(serviceAccount);
  }
}
