export const FILTER_DEFAULTS = {
  portfolioName: 'All',
  valueStream: [],
  fundingStatus: [],
  driver: [],
  recommendation: [],
  bcrThreshold: 'all',
  search: ''
};

export const applyFilters = (items, filters) => items.filter((item) => {
  if (filters.portfolioName !== 'All' && item.portfolioName !== filters.portfolioName) return false;
  if (filters.valueStream.length && !filters.valueStream.includes(item.valueStream)) return false;
  if (filters.fundingStatus.length && !filters.fundingStatus.includes(item.fundingStatus)) return false;
  if (filters.driver.length && !filters.driver.includes(item.driver)) return false;
  if (filters.recommendation.length && !filters.recommendation.includes(item.recommendation)) return false;
  if (filters.bcrThreshold === 'hasBcr' && (item.bcr == null || Number.isNaN(Number(item.bcr)))) return false;
  if (filters.bcrThreshold === 'gte1' && Number(item.bcr) < 1) return false;
  if (filters.bcrThreshold === 'gte2' && Number(item.bcr) < 2) return false;
  if (filters.bcrThreshold === 'lt1' && Number(item.bcr) >= 1) return false;
  if (filters.search) {
    const blob = `${item.id} ${item.name} ${item.capability} ${item.ouSponsor} ${item.outcomes}`.toLowerCase();
    if (!blob.includes(filters.search.toLowerCase())) return false;
  }
  return true;
});

export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const computeKpis = (items) => {
  const total = sum(items.map((x) => x.totalCapitalCost));
  const unfunded = sum(items.filter((x) => x.fundingStatus !== 'Funded').map((x) => x.totalCapitalCost));
  const withBcr = items.filter((x) => typeof x.bcr === 'number');
  return {
    initiatives: items.length,
    totalCapital: total,
    unfundedPct: total ? (unfunded / total) * 100 : 0,
    avgBcr: withBcr.length ? sum(withBcr.map((x) => x.bcr)) / withBcr.length : 0
  };
};

export const byCategory = (items, key, metric = 'totalCapitalCost') => {
  const m = new Map();
  items.forEach((item) => m.set(item[key], (m.get(item[key]) ?? 0) + Number(item[metric] ?? 0)));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export const byYearFunding = (items) => {
  const years = ['year2026', 'year2027', 'year2028'];
  return years.map((year) => {
    let funded = 0;
    let unfunded = 0;
    items.forEach((item) => {
      if (item.fundingStatus === 'Funded') funded += Number(item[year] ?? 0);
      else unfunded += Number(item[year] ?? 0);
    });
    return { year: year.slice(4), funded, unfunded };
  });
};

export const bcrBuckets = (items) => {
  const bins = ['<0.8', '0.8-1.0', '1.0-1.5', '1.5-2.0', '2.0+'];
  const counts = [0, 0, 0, 0, 0];
  items.forEach((item) => {
    const v = Number(item.bcr);
    if (Number.isNaN(v)) return;
    if (v < 0.8) counts[0] += 1;
    else if (v < 1) counts[1] += 1;
    else if (v < 1.5) counts[2] += 1;
    else if (v < 2) counts[3] += 1;
    else counts[4] += 1;
  });
  return { bins, counts };
};

export const topInitiatives = (items, limit = 12) => [...items]
  .sort((a, b) => b.totalCapitalCost - a.totalCapitalCost)
  .slice(0, limit);

export const matrixByPortfolioValueStream = (items) => {
  const portfolios = [...new Set(items.map((x) => x.portfolioName))].sort();
  const streams = [...new Set(items.map((x) => x.valueStream))].sort();
  const matrix = streams.map((stream) => portfolios.map((portfolio) => {
    const total = sum(items.filter((x) => x.valueStream === stream && x.portfolioName === portfolio).map((x) => x.totalCapitalCost));
    return Number(total.toFixed(1));
  }));
  return { portfolios, streams, matrix };
};

export const decisionSets = (items) => ({
  decisions: items.filter((x) => ['CANCEL', 'DELAY', 'REDUCE SCOPE'].includes(x.recommendation)).slice(0, 8),
  offsets: [...items].filter((x) => x.fundingStatus !== 'Funded').sort((a, b) => b.totalCapitalCost - a.totalCapitalCost).slice(0, 8)
});
