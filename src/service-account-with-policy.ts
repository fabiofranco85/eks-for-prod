import {Construct} from '@aws-cdk/core';
import {Policy, PolicyDocument} from '@aws-cdk/aws-iam';
import {ICluster, ServiceAccount} from '@aws-cdk/aws-eks';

export interface EksServiceAccountProps {
  cluster: ICluster,
  serviceAccountName: string,
  jsonPolicy: any,

  /**
   * Optional. Default is <strong>kube-system</strong>
   */
  serviceAccountNamespace?: string
}

export class ServiceAccountWithPolicy extends Construct {

  serviceAccount: ServiceAccount;

  constructor(scope: Construct, id: string, props: EksServiceAccountProps) {
    super(scope, id);

    const saPolicy = new Policy(this, `${props.serviceAccountName}-policy`, {
      document: PolicyDocument.fromJson(props.jsonPolicy)
    });

    this.serviceAccount = props.cluster.addServiceAccount(props.serviceAccountName, {
      namespace: !props.serviceAccountNamespace ? 'kube-system' : props.serviceAccountNamespace,
      name: props.serviceAccountName
    });

    this.serviceAccount.role.attachInlinePolicy(saPolicy);
  }
}
