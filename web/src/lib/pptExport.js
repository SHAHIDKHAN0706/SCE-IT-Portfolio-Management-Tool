import { computeKpis, byCategory, byYearFunding, bcrBuckets, topInitiatives, decisionSets } from './analytics.js';

const money = (v) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;

const addHeader = (slide, exhibit, title) => {
  slide.addText(`EXHIBIT ${exhibit}`, { x: 0.5, y: 0.2, w: 3, h: 0.2, fontFace: 'Georgia', color: '00643D', bold: true, fontSize: 11 });
  slide.addText(title, { x: 0.5, y: 0.45, w: 12, h: 0.5, fontFace: 'Georgia', color: '0E1A26', bold: true, fontSize: 24 });
};

const addBullets = (slide, lines) => {
  let y = 1.2;
  lines.forEach((line) => {
    slide.addText(`• ${line}`, { x: 0.8, y, w: 11.5, h: 0.35, fontFace: 'Inter', color: '1F3A5F', fontSize: 14 });
    y += 0.42;
  });
};

export const generateExecutiveDeck = async (items, filters) => {
  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'SCE IT Portfolio Management Tool';
  pptx.company = 'SCE';
  pptx.subject = 'Portfolio Executive Review';
  pptx.title = 'SCE IT Portfolio Executive Deck';

  const kpis = computeKpis(items);
  const portfolioMix = byCategory(items, 'portfolioName').slice(0, 6);
  const fundingGap = byYearFunding(items);
  const valueStreams = byCategory(items, 'valueStream').slice(0, 6);
  const bcr = bcrBuckets(items);
  const top = topInitiatives(items, 10);
  const { decisions, offsets } = decisionSets(items);

  const slides = [
    ['Cover', [`Generated ${new Date().toLocaleDateString()}`, `Filter scope: ${filters.portfolioName}`]],
    ['Executive Summary', [`${kpis.initiatives} initiatives in scope`, `${money(kpis.totalCapital)} total capital`, `${kpis.unfundedPct.toFixed(1)}% unfunded`]],
    ['Portfolio Mix', portfolioMix.map(([k, v]) => `${k}: ${money(v)}`)],
    ['Funding Gap', fundingGap.map((r) => `${r.year}: Funded ${money(r.funded)} | Unfunded ${money(r.unfunded)}`)],
    ['Capital Deployment by Year', fundingGap.map((r) => `${r.year} total: ${money(r.funded + r.unfunded)}`)],
    ['Value Stream Scorecard', valueStreams.map(([k, v]) => `${k}: ${money(v)}`)],
    ['BCR Analysis', bcr.bins.map((b, i) => `${b}: ${bcr.counts[i]} initiatives`)],
    ['Top Initiatives', top.slice(0, 6).map((x) => `${x.id} ${x.name} — ${money(x.totalCapitalCost)}`)],
    ['Four Executive Decisions', decisions.slice(0, 4).map((x) => `${x.id}: ${x.recommendation}`)],
    ['Offset Candidates', offsets.slice(0, 6).map((x) => `${x.id}: ${money(x.totalCapitalCost)} unfunded`)],
    ['Closing', ['Recommendation mix and offsets reflect current filter state.', 'Use this deck for steering committee review.']]
  ];

  slides.forEach(([title, lines], i) => {
    const slide = pptx.addSlide();
    addHeader(slide, i + 1, title);
    addBullets(slide, lines);
  });

  await pptx.writeFile({ fileName: `SCE_IT_Portfolio_Executive_${new Date().toISOString().slice(0, 10)}.pptx` });
};
