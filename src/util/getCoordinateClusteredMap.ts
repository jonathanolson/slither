import _ from '../workarounds/_';

export const getCoordinateClusteredMap = (values: number[], threshold: number): Map<number, number> => {
  const sortedValues = _.sortBy(values);
  const clusters: number[][] = [];
  let currentCluster: number[] = [];

  for (let i = 0; i < sortedValues.length; i++) {
    const value = sortedValues[i];

    if (currentCluster.length === 0 || Math.abs(currentCluster[currentCluster.length - 1] - value) <= threshold) {
      currentCluster.push(value);
    } else {
      clusters.push(currentCluster);
      currentCluster = [value];
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const clusterMap = new Map<number, number>();
  clusters.forEach((cluster) => {
    const average = _.sum(cluster) / cluster.length;
    cluster.forEach((value) => clusterMap.set(value, average));
  });
  return clusterMap;
};
