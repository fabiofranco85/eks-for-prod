import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {readFileSync} from 'fs';
import YAML from 'yaml';

export interface ClusterOverprovisionerProps {
  cluster: ICluster
}

export class ClusterOverprovisioner extends Construct {

  constructor(scope: Construct, id: string, props: ClusterOverprovisionerProps) {
    super(scope, id);

    const valuesYaml = readFileSync('./lib/eks-cluster/chart-values/clusteroverprovisioner-values.yaml', {encoding: 'utf-8'});
    const valuesJson = YAML.parse(valuesYaml);

    props.cluster.addHelmChart('ClusterOverprovisionerHelmChart', {
      release: 'cluster-overprovisioner',
      chart: 'cluster-overprovisioner',
      repository: 'https://charts.deliveryhero.io',
      values: valuesJson
    });
  }
}
