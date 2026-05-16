import ForceGraph2D from 'react-force-graph-2d';
import styles from './NetworkGraphCard.module.css';

export default function NetworkGraphCard({ graph }: { graph: { nodes: Array<{ id: string; name: string }>; links: Array<{ source: string; target: string; type: string }> } }) {
  return (
    <div className={styles.root}>
      <ForceGraph2D width={700} height={360} graphData={{ nodes: graph.nodes as never[], links: graph.links as never[] }} nodeLabel='name' linkLabel='type' />
      <small>Legend: sharedSponsor | fundingSource | capabilityOverlap | dependsOn</small>
    </div>
  );
}
