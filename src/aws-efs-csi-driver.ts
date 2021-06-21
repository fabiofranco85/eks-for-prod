import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {ServiceAccountWithPolicy} from './service-account-with-policy';
import {awsEfsCsiDriverPolicy} from './service-account-policies/aws-efs-csi-driver-policy';

export interface AwsEfsCsiDriverProps {
  cluster: ICluster;
}

export class AwsEfsCsiDriver extends Construct {

  constructor(scope: Construct, id: string, props: AwsEfsCsiDriverProps) {
    super(scope, id);

    const serviceAccount = new ServiceAccountWithPolicy(this, 'AwsEfsCsiDriverServiceAccount', {
      cluster: props.cluster,
      serviceAccountName: 'aws-efs-csi-driver',
      serviceAccountNamespace: 'kube-system',
      jsonPolicy: awsEfsCsiDriverPolicy
    });

    const helmChart = props.cluster.addHelmChart('AwsEfsCsiDriverHelmChart', {
      namespace: 'kube-system',
      release: 'aws-efs-csi-driver',
      version: '2.0.1',
      chart: 'aws-efs-csi-driver',
      repository: 'https://kubernetes-sigs.github.io/aws-efs-csi-driver',
      values: {
        image: {
          repository: '602401143452.dkr.ecr.us-east-1.amazonaws.com/eks/aws-efs-csi-driver'
        },
        controller: {
          serviceAccount: {
            create: false,
            name: serviceAccount.serviceAccount.serviceAccountName
          }
        }
      }
    });

    helmChart.node.addDependency(serviceAccount);
  }
}
