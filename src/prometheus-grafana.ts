import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {Utils} from './utils';

export interface PrometheusGrafanaProps {
  cluster: ICluster
}

export class PrometheusGrafana extends Construct {

  constructor(scope: Construct, id: string, props: PrometheusGrafanaProps) {
    super(scope, id);

    const prometheusNamespace = Utils.applyYamlManifest(props.cluster, 'namespace-prometheus');

    props.cluster.addHelmChart('PrometheusChart', {
      release: 'prometheus',
      chart: 'prometheus',
      repository: 'https://prometheus-community.github.io/helm-charts',
      namespace: 'prometheus'
    }).node.addDependency(prometheusNamespace);

    Utils.applyYamlManifest(props.cluster, 'grafana')
      .node.addDependency(prometheusNamespace);
  }

}
