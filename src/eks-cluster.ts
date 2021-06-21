import {Construct, Duration, RemovalPolicy, Stack, StackProps, Stage, StageProps} from '@aws-cdk/core';
import {CapacityType, CfnNodegroup, Cluster, ICluster, KubernetesVersion, Nodegroup} from '@aws-cdk/aws-eks';
import {AwsLoadBalancerController} from './aws-load-balancer-controller';
import {ClusterAutoscaler} from './cluster-autoscaler';
import {ClusterOverprovisioner} from './cluster-overprovisioner';
import {InstanceClass, InstanceSize, InstanceType, SubnetType} from '@aws-cdk/aws-ec2';
import {AwsNodeTerminationHandler} from './aws-node-termination-handler';
import {PrometheusGrafana} from './prometheus-grafana';
import {MetricsServer} from './metrics-server';
import {AwsEfsCsiDriver} from './aws-efs-csi-driver';
import {ExternalSecrets} from './external-secrets';
import {Utils} from './utils';
import {FileSystem, LifecyclePolicy} from '@aws-cdk/aws-efs';
import {AuroraCapacityUnit, DatabaseClusterEngine, ServerlessCluster} from '@aws-cdk/aws-rds';

export class EksCluster extends Construct {

  cluster: ICluster;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.cluster = this.createEksCluster();

    new AwsLoadBalancerController(this, 'AWSLoadBalancerController', {cluster: this.cluster});
    new AwsNodeTerminationHandler(this, 'AwsNodeTerminationHandler', {cluster: this.cluster});
    new AwsEfsCsiDriver(this, 'AwsEfsCsiDriver', {cluster: this.cluster});
    new ClusterAutoscaler(this, 'ClusterAutoScaler', {cluster: this.cluster});
    new ClusterOverprovisioner(this, 'ClusterOverProvisioner', {cluster: this.cluster});
    new MetricsServer(this, 'MetricsServer', {cluster: this.cluster});
    new PrometheusGrafana(this, 'PrometheusGrafana', {cluster: this.cluster});
    new ExternalSecrets(this, 'ExternalSecrets', {cluster: this.cluster});

    this.createSpotNodeGroups(this.cluster);
  }

  private createEksCluster() {
    return new Cluster(this, 'EKSCluster', {
      version: KubernetesVersion.V1_20,
      clusterName: 'k8s-cluster'
    });
  }

  private createSpotNodeGroups(cluster: ICluster) {
    [InstanceSize.XLARGE, InstanceSize.XLARGE2].forEach(instanceSize => {
      const nodeGroup = new Nodegroup(this, 'SpoInstancesNodeGroup' + instanceSize, {
        cluster,
        labels: {
          lifecycle: 'Ec2Spot',
          intent: 'apps'
        },
        capacityType: CapacityType.SPOT,
        minSize: 1,
        maxSize: 5,
        desiredSize: 1,
        subnets: cluster.vpc.selectSubnets({
          subnetType: SubnetType.PRIVATE
        }),
        instanceTypes: [
          InstanceType.of(InstanceClass.M5, instanceSize), InstanceType.of(InstanceClass.M5D, instanceSize),
          InstanceType.of(InstanceClass.M5A, instanceSize), InstanceType.of(InstanceClass.M4, instanceSize),
          InstanceType.of(InstanceClass.T3, instanceSize), InstanceType.of(InstanceClass.T3A, instanceSize),
          InstanceType.of(InstanceClass.T2, instanceSize),
        ]
      });

      (nodeGroup.node.defaultChild as CfnNodegroup).taints = [
        {
          key: 'spotInstance',
          value: 'true',
          effect: 'NO_SCHEDULE'
        }
      ];
    });
  }

}

export class EksClusterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eksCluster = new EksCluster(this, 'EksCluster');

    const fileSystem = new FileSystem(this, 'EfsFileSystem', {
      vpc: eksCluster.cluster.vpc,
      enableAutomaticBackups: true,
      encrypted: true,
      fileSystemName: 'eks-cluster-filesystem',
      lifecyclePolicy: LifecyclePolicy.AFTER_30_DAYS,
      removalPolicy: RemovalPolicy.RETAIN,
      vpcSubnets: eksCluster.cluster.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE
      })
    });

    fileSystem.connections.allowDefaultPortFrom(eksCluster.cluster);

    Utils.applyYamlManifest(eksCluster.cluster, 'aws-efs-csi-driver-storage-class', manifestContent =>
      manifestContent.replace('<FILESYSTEM_ID>', fileSystem.fileSystemId));

    const database = new ServerlessCluster(this, 'Database', {
      vpc: eksCluster.cluster.vpc,
      vpcSubnets: eksCluster.cluster.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE
      }),
      engine: DatabaseClusterEngine.AURORA_MYSQL,
      scaling: {
        minCapacity: AuroraCapacityUnit.ACU_1,
        maxCapacity: AuroraCapacityUnit.ACU_8
      },
      backupRetention: Duration.days(7),
      removalPolicy: RemovalPolicy.RETAIN
    });

    database.addRotationSingleUser();
  }
}

export class EksClusterStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    new EksClusterStack(this, 'EksClusterStack');
  }
}
