import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {readFileSync} from 'fs';
import {loadAll} from 'js-yaml';
import {Paths} from './paths';

export interface ClusterOverprovisionerProps {
  cluster: ICluster
}

export class ClusterOverprovisioner extends Construct {

  constructor(scope: Construct, id: string, props: ClusterOverprovisionerProps) {
    super(scope, id);

    const valuesYaml = readFileSync(require('path').resolve(__dirname, `${Paths.CHARTS_VALUES}/clusteroverprovisioner-values.yaml`), {encoding: 'utf-8'});
    const valuesJson = loadAll(valuesYaml);

    props.cluster.addHelmChart('ClusterOverprovisionerHelmChart', {
      release: 'cluster-overprovisioner',
      chart: 'cluster-overprovisioner',
      repository: 'https://charts.deliveryhero.io',
      values: valuesJson
    });
  }
}
