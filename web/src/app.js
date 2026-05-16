import { FILTER_DEFAULTS, applyFilters, computeKpis, byCategory, byYearFunding, bcrBuckets, matrixByPortfolioValueStream, decisionSets } from './lib/analytics.js';
import { normalizeDriver, normalizeRecommendation, normalizeFundingStatus, normalizeFunded, normalizeHeaderKey } from './lib/normalize.js';
import { generateExecutiveDeck } from './lib/pptExport.js';

const DATA_KEY = 'sce-portfolio-dataset-v1';
const FILTER_KEY = 'sce-portfolio-filters-v1';
const viewsBase = ['Portfolio Overview', 'Funding Gap Analysis', 'Value Stream Detail', 'Initiatives Register', 'Decisions & Offsets'];

let allData = [];
let filteredData = [];
let pendingFilters = { ...FILTER_DEFAULTS };
let activeFilters = { ...FILTER_DEFAULTS };
let activeView = viewsBase[0];
let charts = [];
let workbookState = null;

const $ = (id) => document.getElementById(id);
const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;

const getViews = () => {
  const portfolios = new Set(allData.map((x) => x.portfolioName));
  return portfolios.size > 1 ? [...viewsBase, 'Cross-Portfolio Matrix'] : [...viewsBase];
};

const saveFilters = () => localStorage.setItem(FILTER_KEY, JSON.stringify(activeFilters));
const loadFilters = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTER_KEY) ?? 'null');
    return { ...FILTER_DEFAULTS, ...(saved || {}) };
  } catch {
    return { ...FILTER_DEFAULTS };
  }
};

const parseDataset = (items) => items.map((item, i) => {
  const funded = normalizeFunded(item.funded);
  const status = normalizeFundingStatus(item.fundingStatus ?? item.status, funded);
  return {
    id: item.id ?? `IT-${1000 + i}`,
    name: item.name ?? item.capability ?? `Initiative ${i + 1}`,
    capability: item.capability ?? item.name ?? 'Unspecified capability',
    valueStream: item.valueStream ?? 'Shared Services',
    portfolioName: item.portfolioName ?? 'Enterprise Services',
    funded,
    status,
    fundingStatus: status,
    fundingSource: item.fundingSource ?? 'Base',
    driver: normalizeDriver(item.driver),
    recommendation: normalizeRecommendation(item.recommendation),
    bcr: item.bcr == null || item.bcr === '' ? null : Number(item.bcr),
    totalCapitalCost: Number(item.totalCapitalCost ?? 0),
    goLive: item.goLive ?? '2028-12-01',
    ouSponsor: item.ouSponsor ?? 'IT Office',
    outcomes: item.outcomes ?? 'Operational improvement',
    classification: item.classification ?? 'Application',
    dependsOn: item.dependsOn ?? '',
    year2026: Number(item.year2026 ?? 0),
    year2027: Number(item.year2027 ?? 0),
    year2028: Number(item.year2028 ?? 0)
  };
});

const loadData = async () => {
  const local = localStorage.getItem(DATA_KEY);
  if (local) return parseDataset(JSON.parse(local));
  const response = await fetch('./public/sample/snapshot.json');
  return parseDataset(await response.json());
};

const resetCharts = () => {
  charts.forEach((chart) => chart.destroy());
  charts = [];
};

const drawChart = (canvas, config) => {
  const chart = new window.Chart(canvas.getContext('2d'), config);
  charts.push(chart);
  return chart;
};

const csvDownload = (name, rows) => {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
};

const exportChartPng = (chart, name) => {
  const a = document.createElement('a');
  a.href = chart.toBase64Image();
  a.download = name;
  a.click();
};

const multiValues = (id) => [...$(id).selectedOptions].map((o) => o.value).filter(Boolean);

const renderNav = () => {
  const nav = $('sidebarNav');
  nav.innerHTML = '';
  getViews().forEach((view) => {
    const button = document.createElement('button');
    button.className = `nav-btn ${view === activeView ? 'active' : ''}`;
    button.textContent = view;
    button.onclick = () => {
      activeView = view;
      renderAll();
    };
    nav.appendChild(button);
  });
};

const fillSelect = (id, values, current, allowAll = false, multiple = false) => {
  const select = $(id);
  select.innerHTML = '';
  if (allowAll) {
    const opt = new Option('All', 'All');
    select.add(opt);
  }
  values.forEach((value) => select.add(new Option(value, value)));
  if (multiple) {
    [...select.options].forEach((o) => { o.selected = current.includes(o.value); });
  } else {
    select.value = current;
  }
};

const renderFilterOptions = () => {
  const source = allData;
  fillSelect('filterPortfolio', [...new Set(source.map((x) => x.portfolioName))].sort(), pendingFilters.portfolioName, true);
  fillSelect('filterValueStream', [...new Set(source.map((x) => x.valueStream))].sort(), pendingFilters.valueStream, false, true);
  fillSelect('filterFundingStatus', [...new Set(source.map((x) => x.fundingStatus))].sort(), pendingFilters.fundingStatus, false, true);
  fillSelect('filterDriver', [...new Set(source.map((x) => x.driver))].sort(), pendingFilters.driver, false, true);
  fillSelect('filterRecommendation', [...new Set(source.map((x) => x.recommendation))].sort(), pendingFilters.recommendation, false, true);
  $('filterBcrThreshold').value = pendingFilters.bcrThreshold;
  $('filterSearch').value = pendingFilters.search;
};

const renderChips = () => {
  const chips = $('activeChips');
  chips.innerHTML = '';
  const pushChip = (label, key, value, isMulti = false) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = `${label}: ${value} ×`;
    chip.onclick = () => {
      if (isMulti) activeFilters[key] = activeFilters[key].filter((v) => v !== value);
      else activeFilters[key] = FILTER_DEFAULTS[key];
      pendingFilters = JSON.parse(JSON.stringify(activeFilters));
      saveFilters();
      filteredData = applyFilters(allData, activeFilters);
      renderAll();
    };
    chips.appendChild(chip);
  };

  if (activeFilters.portfolioName !== 'All') pushChip('Portfolio', 'portfolioName', activeFilters.portfolioName);
  ['valueStream', 'fundingStatus', 'driver', 'recommendation'].forEach((k) => activeFilters[k].forEach((v) => pushChip(k, k, v, true)));
  if (activeFilters.bcrThreshold !== 'all') pushChip('BCR', 'bcrThreshold', activeFilters.bcrThreshold);
  if (activeFilters.search) pushChip('Search', 'search', activeFilters.search);
};

const renderKpiRail = () => {
  const kpi = computeKpis(filteredData);
  $('kpiRail').innerHTML = `
    <article><h4>Initiatives</h4><p>${kpi.initiatives}</p></article>
    <article><h4>Total Capital</h4><p>${money(kpi.totalCapital)}</p></article>
    <article><h4>Unfunded Share</h4><p>${kpi.unfundedPct.toFixed(1)}%</p></article>
    <article><h4>Average BCR</h4><p>${kpi.avgBcr.toFixed(2)}</p></article>
  `;
};

const exhibit = (id, eyebrow, title, readText, chartBuilders, tableRows) => {
  const section = document.createElement('section');
  section.className = 'module';
  section.innerHTML = `
    <div class="module-header"><p class="eyebrow">${eyebrow}</p><h3>${title}</h3></div>
    <div class="module-tools">
      <button class="btn toggle-btn" data-mode="chart">Chart</button>
      <button class="btn toggle-btn" data-mode="table">Table</button>
      <button class="btn export-png">Export PNG</button>
      <button class="btn export-csv">Export CSV</button>
    </div>
    <div class="module-body">
      <div class="chart-wrap"></div>
      <div class="table-wrap" hidden></div>
      <aside class="read-panel"><h4>Read</h4><p>${readText}</p></aside>
    </div>
  `;

  const chartWrap = section.querySelector('.chart-wrap');
  const tableWrap = section.querySelector('.table-wrap');
  const localCharts = [];

  chartBuilders.forEach((build) => {
    const canvas = document.createElement('canvas');
    canvas.height = 220;
    chartWrap.appendChild(canvas);
    localCharts.push(drawChart(canvas, build()));
  });

  const table = document.createElement('table');
  table.className = 'data-table';
  tableRows.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach((cell) => {
      const td = document.createElement(i === 0 ? 'th' : 'td');
      td.textContent = String(cell);
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  tableWrap.appendChild(table);

  section.querySelectorAll('.toggle-btn').forEach((btn) => {
    btn.onclick = () => {
      const toTable = btn.dataset.mode === 'table';
      chartWrap.hidden = toTable;
      tableWrap.hidden = !toTable;
    };
  });

  section.querySelector('.export-png').onclick = () => {
    if (localCharts[0]) exportChartPng(localCharts[0], `${id}.png`);
  };
  section.querySelector('.export-csv').onclick = () => csvDownload(`${id}.csv`, tableRows);

  return section;
};

const renderEmptyState = () => {
  const wrap = document.createElement('section');
  wrap.className = 'empty-state';
  wrap.innerHTML = `<h3>No initiatives match current filters.</h3><button class="btn btn-primary" id="emptyReset">Reset filters</button>`;
  wrap.querySelector('#emptyReset').onclick = () => {
    activeFilters = { ...FILTER_DEFAULTS };
    pendingFilters = { ...FILTER_DEFAULTS };
    saveFilters();
    filteredData = applyFilters(allData, activeFilters);
    renderAll();
  };
  return wrap;
};

const renderRegister = (container) => {
  const rows = [...filteredData];
  const columns = ['id', 'name', 'portfolioName', 'valueStream', 'fundingStatus', 'driver', 'recommendation', 'bcr', 'totalCapitalCost'];
  let sortKey = 'totalCapitalCost';
  let dir = -1;

  const wrap = document.createElement('section');
  wrap.className = 'module';
  wrap.innerHTML = '<div class="module-header"><p class="eyebrow">EXHIBIT R</p><h3>Initiatives Register</h3></div><div class="register-wrap"></div><div class="module-tools"><button class="btn" id="registerCsv">Export CSV</button></div>';
  const register = wrap.querySelector('.register-wrap');

  const draw = () => {
    rows.sort((a, b) => ((a[sortKey] > b[sortKey]) ? 1 : -1) * dir);
    const table = document.createElement('table');
    table.className = 'data-table sticky';
    const head = document.createElement('tr');
    columns.forEach((c) => {
      const th = document.createElement('th');
      th.tabIndex = 0;
      th.textContent = c;
      th.onclick = () => { sortKey = c; dir *= -1; draw(); };
      head.appendChild(th);
    });
    table.appendChild(head);
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.title = `${row.capability}\n${row.outcomes}`;
      columns.forEach((c) => {
        const td = document.createElement('td');
        td.textContent = c === 'totalCapitalCost' ? money(row[c]) : String(row[c] ?? '');
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    register.innerHTML = '';
    register.appendChild(table);
  };

  draw();
  wrap.querySelector('#registerCsv').onclick = () => {
    csvDownload('initiatives-register.csv', [columns, ...rows.map((row) => columns.map((c) => row[c]))]);
  };
  container.appendChild(wrap);
};

const renderViewContent = () => {
  resetCharts();
  const root = $('viewContent');
  root.innerHTML = '';

  if (!filteredData.length) {
    root.appendChild(renderEmptyState());
    return;
  }

  const fundingYear = byYearFunding(filteredData);
  const portfolioMix = byCategory(filteredData, 'portfolioName');
  const streamMix = byCategory(filteredData, 'valueStream');
  const recommendationMix = byCategory(filteredData, 'recommendation', 'totalCapitalCost');
  const bcr = bcrBuckets(filteredData);
  const matrix = matrixByPortfolioValueStream(filteredData);
  const { decisions, offsets } = decisionSets(filteredData);

  const exhibits = {
    overview: [
      exhibit('portfolio-mix', 'EXHIBIT 1', 'Portfolio Mix', `${portfolioMix[0][0]} leads at ${money(portfolioMix[0][1])}.`, [() => ({
        type: 'bar', data: { labels: portfolioMix.map((x) => x[0]), datasets: [{ label: 'Capital ($M)', data: portfolioMix.map((x) => x[1]), backgroundColor: '#1f3a5f' }] }
      }), () => ({
        type: 'doughnut', data: { labels: recommendationMix.map((x) => x[0]), datasets: [{ data: recommendationMix.map((x) => x[1]), backgroundColor: ['#00643d', '#c47b18', '#a83e2f', '#52606d', '#2a7a7b'] }] }
      })], [['Portfolio', 'Capital ($M)'], ...portfolioMix.map(([k, v]) => [k, v.toFixed(1)])]),
      exhibit('capital-year', 'EXHIBIT 2', 'Capital Deployment by Year', `${money(fundingYear.reduce((a, b) => a + b.unfunded, 0))} remains unfunded across 2026–2028.`, [() => ({
        type: 'bar', data: { labels: fundingYear.map((x) => x.year), datasets: [{ label: 'Funded', data: fundingYear.map((x) => x.funded), backgroundColor: '#00643d' }, { label: 'Unfunded', data: fundingYear.map((x) => x.unfunded), backgroundColor: '#a83e2f' }] }, options: { scales: { x: { stacked: true }, y: { stacked: true } } }
      })], [['Year', 'Funded', 'Unfunded'], ...fundingYear.map((x) => [x.year, x.funded.toFixed(1), x.unfunded.toFixed(1)])])
    ],
    funding: [
      exhibit('funding-gap', 'EXHIBIT 3', 'Funding Gap Analysis', `${((fundingYear[1].unfunded / (fundingYear[1].unfunded + fundingYear[1].funded || 1)) * 100).toFixed(1)}% of 2027 capital is unfunded.`, [() => ({
        type: 'bar', data: { labels: fundingYear.map((x) => x.year), datasets: [{ label: 'Funded', data: fundingYear.map((x) => x.funded), backgroundColor: '#00643d' }, { label: 'Unfunded', data: fundingYear.map((x) => x.unfunded), backgroundColor: '#a83e2f' }] }, options: { scales: { x: { stacked: true }, y: { stacked: true } } }
      }), () => {
        const s = byCategory(filteredData, 'fundingStatus', 'totalCapitalCost');
        return { type: 'doughnut', data: { labels: s.map((x) => x[0]), datasets: [{ data: s.map((x) => x[1]), backgroundColor: ['#00643d', '#c47b18', '#a83e2f'] }] } };
      }], [['Year', 'Funded', 'Unfunded'], ...fundingYear.map((x) => [x.year, x.funded.toFixed(1), x.unfunded.toFixed(1)])])
    ],
    stream: [
      exhibit('value-stream', 'EXHIBIT 4', 'Value Stream Scorecard', `${streamMix[0][0]} is the highest-capital value stream.`, [() => ({
        type: 'bar', data: { labels: streamMix.map((x) => x[0]), datasets: [{ label: 'Capital ($M)', data: streamMix.map((x) => x[1]), backgroundColor: '#2a7a7b' }] }, options: { indexAxis: 'y' }
      })], [['Value Stream', 'Capital ($M)'], ...streamMix.map(([k, v]) => [k, v.toFixed(1)])]),
      exhibit('bcr-analysis', 'EXHIBIT 5', 'BCR Analysis', `${bcr.counts[0] + bcr.counts[1]} initiatives have BCR below 1.0.`, [() => ({
        type: 'bar', data: { labels: bcr.bins, datasets: [{ label: 'Initiatives', data: bcr.counts, backgroundColor: '#1f3a5f' }] }
      })], [['Bucket', 'Count'], ...bcr.bins.map((bin, i) => [bin, bcr.counts[i]])])
    ],
    register: [],
    decisions: [
      exhibit('executive-decisions', 'EXHIBIT 6', 'Executive Decisions and Offsets', `${decisions.length} high-impact decision candidates are flagged.`, [() => ({
        type: 'bar', data: { labels: decisions.map((x) => x.id), datasets: [{ label: 'Capital ($M)', data: decisions.map((x) => x.totalCapitalCost), backgroundColor: '#c47b18' }] }, options: { plugins: { legend: { display: false } } }
      })], [['ID', 'Recommendation', 'Capital'], ...decisions.map((x) => [x.id, x.recommendation, x.totalCapitalCost.toFixed(1)])]),
      exhibit('offset-candidates', 'EXHIBIT 7', 'Offset Candidates', `${offsets.length} offset candidates can backfill funding gaps.`, [() => ({
        type: 'bar', data: { labels: offsets.map((x) => x.id), datasets: [{ label: 'Unfunded Capital ($M)', data: offsets.map((x) => x.totalCapitalCost), backgroundColor: '#a83e2f' }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } } }
      })], [['ID', 'Portfolio', 'Capital'], ...offsets.map((x) => [x.id, x.portfolioName, x.totalCapitalCost.toFixed(1)])])
    ],
    matrix: [
      exhibit('cross-matrix', 'EXHIBIT 8', 'Cross-Portfolio Matrix', `Cross-portfolio concentration appears strongest where rows show darker shading.`, [() => ({
        type: 'bar', data: { labels: matrix.portfolios, datasets: matrix.streams.map((s, i) => ({ label: s, data: matrix.matrix[i], backgroundColor: `hsl(${(i * 45) % 360},45%,45%)` })) }, options: { scales: { x: { stacked: true }, y: { stacked: true } } }
      })], [['Value Stream', ...matrix.portfolios], ...matrix.streams.map((stream, i) => [stream, ...matrix.matrix[i]])])
    ]
  };

  if (activeView === 'Portfolio Overview') exhibits.overview.forEach((x) => root.appendChild(x));
  if (activeView === 'Funding Gap Analysis') exhibits.funding.forEach((x) => root.appendChild(x));
  if (activeView === 'Value Stream Detail') exhibits.stream.forEach((x) => root.appendChild(x));
  if (activeView === 'Initiatives Register') renderRegister(root);
  if (activeView === 'Decisions & Offsets') exhibits.decisions.forEach((x) => root.appendChild(x));
  if (activeView === 'Cross-Portfolio Matrix') exhibits.matrix.forEach((x) => root.appendChild(x));
};

const renderAll = () => {
  renderNav();
  renderFilterOptions();
  renderChips();
  renderKpiRail();
  renderViewContent();
};

const detectHeaderRow = (rows) => {
  for (let i = 0; i < Math.min(rows.length, 5); i += 1) {
    const row = rows[i] || [];
    const stringCount = row.filter((cell) => typeof cell === 'string' && cell.trim()).length;
    if (row.length >= 3 && stringCount >= 3) return i;
  }
  return 0;
};

const buildMappingUI = () => {
  const fields = [
    ['capability', true], ['valueStream', true], ['portfolioName', true], ['funded', true], ['status', true], ['driver', true], ['totalCapitalCost', true],
    ['recommendation', false], ['bcr', false], ['year2026', false], ['year2027', false], ['year2028', false], ['ouSponsor', false], ['outcomes', false], ['classification', false], ['fundingSource', false]
  ];
  const sheetName = $('sheetPicker').value;
  const ws = workbookState.workbook.Sheets[sheetName];
  const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerRow = detectHeaderRow(rows);
  const headers = rows[headerRow].map((h) => String(h));
  workbookState.headerRow = headerRow;
  workbookState.headers = headers;

  const container = $('mappingFields');
  container.innerHTML = '';

  fields.forEach(([field, required]) => {
    const row = document.createElement('label');
    row.className = 'mapping-row';
    const auto = headers.find((h) => normalizeHeaderKey(h) === field) ?? '';
    row.innerHTML = `<span>${field}${required ? ' <strong>*</strong>' : ''} ${auto ? '✅' : ''}</span>`;
    const select = document.createElement('select');
    select.dataset.field = field;
    select.appendChild(new Option('— skip —', ''));
    headers.forEach((h) => select.appendChild(new Option(h, h)));
    select.value = auto;
    row.appendChild(select);
    container.appendChild(row);
  });
  $('mappingError').textContent = '';
};

const applyMappedDataset = () => {
  const required = ['capability', 'valueStream', 'portfolioName', 'funded', 'status', 'driver', 'totalCapitalCost'];
  const selects = [...document.querySelectorAll('#mappingFields select')];
  const mapping = Object.fromEntries(selects.map((s) => [s.dataset.field, s.value]));
  const missing = required.filter((r) => !mapping[r]);
  if (missing.length) {
    $('mappingError').textContent = `Mapping incomplete. Required: ${missing.join(', ')}`;
    return;
  }

  const ws = workbookState.workbook.Sheets[$('sheetPicker').value];
  const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const dataRows = rows.slice(workbookState.headerRow + 1);

  const mapped = dataRows
    .filter((r) => r.some((c) => String(c).trim()))
    .map((row, i) => {
      const get = (key) => row[workbookState.headers.indexOf(mapping[key])];
      const funded = normalizeFunded(get('funded'));
      const totalCapitalCost = Number(get('totalCapitalCost') || 0);
      const year2026 = Number(get('year2026') || totalCapitalCost * 0.34);
      const year2027 = Number(get('year2027') || totalCapitalCost * 0.33);
      const year2028 = Number(get('year2028') || totalCapitalCost * 0.33);
      return {
        id: `UP-${String(i + 1).padStart(4, '0')}`,
        name: get('capability') || `Uploaded initiative ${i + 1}`,
        capability: get('capability') || 'Unknown capability',
        valueStream: get('valueStream') || 'Shared Services',
        portfolioName: get('portfolioName') || 'Enterprise Services',
        funded,
        fundingStatus: normalizeFundingStatus(get('status'), funded),
        fundingSource: get('fundingSource') || 'Uploaded',
        driver: normalizeDriver(get('driver')),
        recommendation: normalizeRecommendation(get('recommendation')),
        bcr: get('bcr') === '' ? null : Number(get('bcr') || 1),
        totalCapitalCost,
        goLive: '2028-12-01',
        ouSponsor: get('ouSponsor') || 'Uploaded Sponsor',
        outcomes: get('outcomes') || 'Uploaded outcome',
        classification: get('classification') || 'Application',
        dependsOn: '',
        year2026,
        year2027,
        year2028
      };
    });

  allData = parseDataset(mapped);
  localStorage.setItem(DATA_KEY, JSON.stringify(allData));
  activeFilters = { ...FILTER_DEFAULTS };
  pendingFilters = { ...FILTER_DEFAULTS };
  filteredData = allData;
  $('mappingModal').close();
  renderAll();
};

const bindEvents = () => {
  $('runAnalysis').onclick = () => {
    activeFilters = {
      portfolioName: $('filterPortfolio').value,
      valueStream: multiValues('filterValueStream'),
      fundingStatus: multiValues('filterFundingStatus'),
      driver: multiValues('filterDriver'),
      recommendation: multiValues('filterRecommendation'),
      bcrThreshold: $('filterBcrThreshold').value,
      search: $('filterSearch').value.trim()
    };
    pendingFilters = JSON.parse(JSON.stringify(activeFilters));
    saveFilters();
    filteredData = applyFilters(allData, activeFilters);
    renderAll();
  };

  $('resetFilters').onclick = () => {
    pendingFilters = { ...FILTER_DEFAULTS };
    activeFilters = { ...FILTER_DEFAULTS };
    saveFilters();
    filteredData = applyFilters(allData, activeFilters);
    renderAll();
  };

  $('refreshData').onclick = async () => {
    localStorage.removeItem(DATA_KEY);
    allData = await loadData();
    filteredData = applyFilters(allData, activeFilters);
    renderAll();
  };

  $('generateDeck').onclick = async () => generateExecutiveDeck(filteredData, activeFilters);

  $('loadXlsx').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    workbookState = { workbook: window.XLSX.read(buffer, { type: 'array' }) };
    const sheets = workbookState.workbook.SheetNames;
    $('sheetPicker').innerHTML = '';
    sheets.forEach((sheet) => $('sheetPicker').appendChild(new Option(sheet, sheet)));
    buildMappingUI();
    $('mappingModal').showModal();
  });

  $('sheetPicker').onchange = buildMappingUI;
  $('applyMapping').onclick = applyMappedDataset;
  $('cancelMapping').onclick = () => $('mappingModal').close();
  $('resetBundled').onclick = async () => {
    localStorage.removeItem(DATA_KEY);
    allData = await loadData();
    filteredData = applyFilters(allData, activeFilters);
    $('mappingModal').close();
    renderAll();
  };
};

const init = async () => {
  pendingFilters = loadFilters();
  activeFilters = JSON.parse(JSON.stringify(pendingFilters));
  allData = await loadData();
  filteredData = applyFilters(allData, activeFilters);
  bindEvents();
  renderAll();
};

init();
