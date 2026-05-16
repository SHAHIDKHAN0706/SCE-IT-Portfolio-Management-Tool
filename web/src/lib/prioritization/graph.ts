import type { Initiative } from '../../types/model';

const tokenJaccard = (a: string, b: string) => {
  const sa = new Set(a.toLowerCase().split(/\s+/));
  const sb = new Set(b.toLowerCase().split(/\s+/));
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const union = new Set([...sa, ...sb]).size;
  return union ? inter / union : 0;
};

export function buildDependencyGraph(items: Initiative[]) {
  const nodes = items.map((i) => ({ id: i.id, name: i.name, group: i.valueStream }));
  const links: Array<{ source: string; target: string; type: string }> = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].ouSponsor === items[j].ouSponsor) links.push({ source: items[i].id, target: items[j].id, type: 'sharedSponsor' });
      if (items[i].fundingSource === items[j].fundingSource) links.push({ source: items[i].id, target: items[j].id, type: 'fundingSource' });
      if (tokenJaccard(items[i].capability, items[j].capability) >= 0.4) links.push({ source: items[i].id, target: items[j].id, type: 'capabilityOverlap' });
    }
    if (items[i].dependsOn) {
      const deps = items[i].dependsOn?.split(',') ?? [];
      deps.map((s) => s.trim()).filter(Boolean).forEach((dep) => links.push({ source: items[i].id, target: dep, type: 'dependsOn' }));
    }
  }
  return { nodes, links };
}
