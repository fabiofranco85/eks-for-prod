import {ICluster, KubernetesManifest} from '@aws-cdk/aws-eks';
import {readFileSync} from 'fs';
import YAML from 'yaml';
import {Paths} from './paths';

export class Utils {

  static applyYamlManifest(cluster: ICluster, id: string,
                           preProcessor?: (manifestContent: string) => string): KubernetesManifest {

    let yaml = readFileSync(`${Paths.MANIFESTS}/${id}.yaml`, {encoding: 'utf-8'});
    yaml = preProcessor ? preProcessor(yaml) : yaml;

    const manifest = YAML.parse(yaml);
    return cluster.addManifest(id, manifest);
  }
}
