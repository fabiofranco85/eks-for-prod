import {Construct} from '@aws-cdk/core';
import {ICluster} from '@aws-cdk/aws-eks';
import {Utils} from './utils';

export interface AwsNodeTerminationHandlerProps {
  cluster: ICluster
}

export class AwsNodeTerminationHandler extends Construct {

  constructor(scope: Construct, id: string, props: AwsNodeTerminationHandlerProps) {
    super(scope, id);

    Utils.applyYamlManifest(props.cluster,'aws-node-termination-handler');
  }
}
