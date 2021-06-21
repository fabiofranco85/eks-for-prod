## EKS Cluster + EFS Filesystem + Aurora Serverless

This package provides a fully functional [AWS EKS Cluster](https://aws.amazon.com/eks/).

Alongside the cluster there is an [AWS EFS Filesystem](https://aws.amazon.com/efs/) that will provide file 
persistence for the cluster plus an [AWS Aurora Serverless](https://aws.amazon.com/rds/aurora/serverless/) 
which will serve as the relational database for the cluster's applications.

The [Kubernetes](https://kubernetes.io/) cluster itself is provided with the following components:

* [AWS LoadBalancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller)
* [AWS Node Termination Handler](https://github.com/aws/aws-node-termination-handler)
* [AWS EFS CSI Driver](https://github.com/kubernetes-sigs/aws-efs-csi-driver)
* [Cluster Autoscaler](https://github.com/kubernetes/autoscaler)
* [Cluster Overprovisioner](https://github.com/deliveryhero/helm-charts/tree/master/stable/cluster-overprovisioner)
* [Metrics Server](https://github.com/kubernetes-sigs/metrics-server)
* [Prometheus](https://prometheus.io/)
* [Grafana](https://grafana.com/)
* [External Secrets](https://github.com/external-secrets/kubernetes-external-secrets)
