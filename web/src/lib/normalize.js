const mapByIncludes = (value, mappings, fallback) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  for (const [keys, target] of mappings) {
    if (keys.some((key) => normalized.includes(key))) return target;
  }
  return fallback;
};

export const normalizeDriver = (value) => mapByIncludes(value, [
  [['cyber', 'compliance'], 'Cyber-Compliance'],
  [['obsol', 'tech'], 'Technology Obsolescence'],
  [['strategy', 'strategic'], 'Strategy'],
  [['business'], 'Business Need'],
  [['multi'], 'Multi-Driver']
], 'Other');

export const normalizeRecommendation = (value) => mapByIncludes(value, [
  [['continue', 'keep'], 'CONTINUE'],
  [['delay', 'defer'], 'DELAY'],
  [['cancel', 'stop'], 'CANCEL'],
  [['reduce', 'scope'], 'REDUCE SCOPE'],
  [['merge'], 'MERGE-WITH:RELATED']
], 'CONTINUE');

export const normalizeFundingStatus = (value, funded) => {
  const explicit = mapByIncludes(value, [
    [['partial'], 'Partially Funded'],
    [['unfunded', 'not funded'], 'Unfunded'],
    [['funded'], 'Funded']
  ], '');
  if (explicit) return explicit;
  if (funded === true) return 'Funded';
  if (funded === false) return 'Unfunded';
  return 'Partially Funded';
};

export const normalizeFunded = (value) => {
  const s = String(value ?? '').trim().toLowerCase();
  if (['true', 'yes', 'y', 'funded', '1'].includes(s)) return true;
  if (['false', 'no', 'n', 'unfunded', '0'].includes(s)) return false;
  return s.includes('partial') ? false : Boolean(value);
};

export const normalizeHeaderKey = (header) => {
  const h = String(header ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const aliases = {
    capability: ['capability', 'initiative', 'projectname'],
    valueStream: ['valuestream', 'stream'],
    portfolioName: ['portfolio', 'portfolioname'],
    funded: ['funded', 'isfunded'],
    status: ['status', 'fundingstatus'],
    driver: ['driver', 'businessdriver'],
    totalCapitalCost: ['totalcapitalcost', 'capitalcost', 'totalcapex', 'totalcost'],
    recommendation: ['recommendation', 'decision'],
    bcr: ['bcr', 'benefitcostratio'],
    year2026: ['year2026', 'fy2026', 'cap2026'],
    year2027: ['year2027', 'fy2027', 'cap2027'],
    year2028: ['year2028', 'fy2028', 'cap2028'],
    ouSponsor: ['ousponsor', 'sponsor'],
    outcomes: ['outcomes', 'benefits'],
    classification: ['classification', 'class'],
    fundingSource: ['fundingsource', 'source']
  };
  for (const [key, values] of Object.entries(aliases)) {
    if (values.includes(h)) return key;
  }
  return null;
};
