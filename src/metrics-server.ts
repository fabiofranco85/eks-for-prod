import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {Utils} from './utils';

export interface MetricsServerProps {
  cluster: ICluster
}

export class MetricsServer extends Construct {

  constructor(scope: Construct, id: string, props: MetricsServerProps) {
    super(scope, id);

    Utils.applyYamlManifest(props.cluster, 'metrics-server');
  }
}
