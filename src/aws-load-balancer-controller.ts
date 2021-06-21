import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {awsLoadBalancerDriverPolicy} from './service-account-policies/aws-load-balancer-driver-policy';
import {ServiceAccountWithPolicy} from './service-account-with-policy';
import {Utils} from './utils';

export interface AwsLoadBalancerControllerProps {
  cluster: ICluster
}

export class AwsLoadBalancerController extends Construct {

  constructor(scope: Construct, id: string, props: AwsLoadBalancerControllerProps) {
    super(scope, id);

    const serviceAccount = new ServiceAccountWithPolicy(this, 'AlbControllerServiceAccount', {
      cluster: props.cluster,
      serviceAccountName: 'aws-load-balancer-controller',
      jsonPolicy: awsLoadBalancerDriverPolicy
    }).serviceAccount;

    const crds = Utils.applyYamlManifest(props.cluster,'aws-load-balancer-controller-crds');

    const helmChart = props.cluster.addHelmChart('AWSLoabBalancerControllerHelmChart', {
      release: 'aws-load-balancer-controller',
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',
      values: {
        clusterName: props.cluster.clusterName,
        serviceAccount: {
          create: false,
          name: serviceAccount.serviceAccountName
        }
      }
    });

    /**
     * Weird workaround - keep an eye on permanent solution. Found on:
     * https://github.com/aws/aws-cdk/issues/11475#issuecomment-727552723 and
     * https://github.com/aws/aws-cdk/issues/11475#issuecomment-736384696
     */
    helmChart.node.addDependency(
      serviceAccount,
      serviceAccount.node.findChild('manifest-aws-load-balancer-controllerServiceAccountResource'),
      crds
    );
  }
}
