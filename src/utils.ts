import {ICluster, KubernetesManifest} from '@aws-cdk/aws-eks';
import {readFileSync} from 'fs';
import {loadAll} from 'js-yaml';
import {Paths} from './paths';

export class Utils {

  static applyYamlManifest(cluster: ICluster, id: string,
                           preProcessor?: (manifestContent: string) => string): KubernetesManifest {

    let yaml = readFileSync(require('path').resolve(__dirname, `${Paths.MANIFESTS}/${id}.yaml`), {encoding: 'utf-8'});
    yaml = preProcessor ? preProcessor(yaml) : yaml;

    const manifest = loadAll(yaml);
    return cluster.addManifest(id, ...manifest);
  }
}
