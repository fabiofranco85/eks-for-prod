import {Construct, Tags} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {ServiceAccountWithPolicy} from './service-account-with-policy';
import {clusterAutoscalerPolicy} from './service-account-policies/cluster-autoscaler-policy';
import {Utils} from './utils';

export interface ClusterAutoscalerProps {
  cluster: ICluster
}

export class ClusterAutoscaler extends Construct {

  constructor(scope: Construct, id: string, props: ClusterAutoscalerProps) {
    super(scope, id);

    const serviceAccount = new ServiceAccountWithPolicy(this, 'ClusterAutoScalerServiceAccount', {
      cluster: props.cluster,
      jsonPolicy: clusterAutoscalerPolicy,
      serviceAccountName: 'cluster-autoscaler'
    });

    Tags.of(serviceAccount).add('k8s-addon', 'cluster-autoscaler.addons.k8s.io');
    Tags.of(serviceAccount).add('k8s-app', 'cluster-autoscaler');

    Utils.applyYamlManifest(props.cluster, 'cluster-autoscaler-autodiscover',
      manifestContent => manifestContent.replace('<YOUR CLUSTER NAME>', props.cluster.clusterName)
    ).node.addDependency(serviceAccount);
  }
}
