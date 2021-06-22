## EKS Cluster + EFS Filesystem + Aurora Serverless

### Introduction

This package provides an [AWS Cloud Development Kit - CDK](https://aws.amazon.com/cdk/) application with a fully functional [AWS EKS Cluster](https://aws.amazon.com/eks/) with some very interesting production grade perks.

Mainly alongside the cluster there is an [AWS EFS Filesystem](https://aws.amazon.com/efs/) to provide file 
persistence plus an [AWS Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/) db cluster 
to serve as the relational database for the cluster's applications.

The [Kubernetes](https://kubernetes.io/) cluster itself comes with the following components:

* [AWS LoadBalancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller)
* [AWS Node Termination Handler](https://github.com/aws/aws-node-termination-handler)
* [AWS EFS CSI Driver](https://github.com/kubernetes-sigs/aws-efs-csi-driver)
* [Cluster Autoscaler](https://github.com/kubernetes/autoscaler)
* [Cluster Overprovisioner](https://github.com/deliveryhero/helm-charts/tree/master/stable/cluster-overprovisioner)
* [Metrics Server](https://github.com/kubernetes-sigs/metrics-server)
* [Prometheus](https://prometheus.io/)
* [Grafana](https://grafana.com/)
* [External Secrets](https://github.com/external-secrets/kubernetes-external-secrets)

### Kubernetes Cluster Details

#### Network

Currently the default VPC setting is used.

#### NodeGroups

All nodes are privisioned in the private subnets of the cluster.

##### Control Apps

The cluster comes with its default capacity for the control plane components and is meant also for all other control apps _(further capacity customization will be added)_. Currently the default capacity provided by cdk is 2 instances of `m5.large` managed node group.

##### Applications

There are 2 managed node groups of [SPOT](https://aws.amazon.com/ec2/spot/) instances meant for applications. The groups are a combination selected from the families `m5`, m5d`, m5a`, m4`, t3`, t3a`, t2` of sizes `xlarge` and `2xlarge`. The current minimum size is 1 and maximum of 5 instances with desired size of 1 instance.
