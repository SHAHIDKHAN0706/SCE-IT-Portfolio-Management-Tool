import PptxGenJS from 'pptxgenjs';
import type { Initiative } from '../../types/model';
import type { OverlapCluster } from '../prioritization/similarity';

export async function buildDeck(items: Initiative[], clusters: OverlapCluster[]) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const title = (slide: PptxGenJS.Slide, t: string) => {
    slide.addText('SCE IT Portfolio Management Tool', { x: 0.3, y: 0.2, w: 12.5, h: 0.4, color: '0073CF', bold: true, fontFace: 'Inter' });
    slide.addText(t, { x: 0.3, y: 0.8, w: 12.5, h: 0.8, color: '002A3A', bold: true, fontFace: 'Source Serif 4', fontSize: 26 });
  };

  const labels = [
    'Executive Summary', 'Portfolio Overview', 'Funding Gap Analysis', 'Value Stream Detail', 'Initiatives Register',
    'Decisions & Offsets', 'Cross-Portfolio Matrix', 'Risk & Dependencies', 'Priority Ranking — Top N', 'Overlap & Consolidation Candidates',
    'Recommendations', 'Appendix A', 'Appendix B',
  ];

  labels.forEach((l, idx) => {
    const s = pptx.addSlide();
    title(s, `${idx + 1}. ${l}`);
    if (l.includes('Priority Ranking')) {
      const top = [...items].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0)).slice(0, 10);
      top.forEach((i, n) => s.addText(`${n + 1}. ${i.id} ${i.name} — ${(i.priorityScore ?? 0).toFixed(1)}`, { x: 0.6, y: 1.8 + n * 0.4, w: 12, h: 0.3, fontFace: 'Inter', fontSize: 12 }));
    } else if (l.includes('Overlap')) {
      clusters.forEach((c, n) => s.addText(`Cluster ${n + 1}: ${c.ids.join(', ')}`, { x: 0.6, y: 1.8 + n * 0.5, w: 12, h: 0.4, fontFace: 'Inter', fontSize: 12 }));
    } else {
      s.addText(`Records in scope: ${items.length}`, { x: 0.6, y: 1.8, w: 12, h: 0.4, fontFace: 'Inter', fontSize: 14, color: '3C4858' });
    }
  });

  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  await pptx.writeFile({ fileName: `SCE_IT_Portfolio_Executive_${stamp}.pptx` });
}
