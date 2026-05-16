import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AppShell, Sidebar, TopBar, Select, MultiSelect, SearchField, Button, FilterChip } from './components/ui';
import type { Filters, Initiative } from './types/model';
import { applyFilters, defaultFilters } from './lib/data/filter';
import { loadDataset, resetDataset, saveDataset, loadWeights, saveWeights } from './lib/data/storage';
import defaults from './lib/prioritization/weights.json';
import type { Weights } from './lib/prioritization/score';
import { scoreInitiative } from './lib/prioritization/score';
import { findOverlapClusters } from './lib/prioritization/similarity';
import { buildDeck } from './lib/ppt/buildDeck';
import PortfolioOverview from './pages/PortfolioOverview';
import FundingGapAnalysis from './pages/FundingGapAnalysis';
import ValueStreamDetail from './pages/ValueStreamDetail';
import InitiativesRegister from './pages/InitiativesRegister';
import DecisionsOffsets from './pages/DecisionsOffsets';
import Prioritization from './pages/Prioritization';

const navItems = [
  { to: '/overview', label: 'Portfolio Overview' },
  { to: '/funding-gap', label: 'Funding Gap Analysis' },
  { to: '/value-stream', label: 'Value Stream Detail' },
  { to: '/register', label: 'Initiatives Register' },
  { to: '/decisions', label: 'Decisions & Offsets' },
  { to: '/prioritization', label: 'Prioritization' },
];

const fields = ['id', 'name', 'portfolioName', 'valueStream', 'funded', 'fundingStatus', 'fundingSource', 'driver', 'recommendation', 'bcr', 'totalCapitalCost', 'goLive', 'ouSponsor', 'outcomes', 'classification', 'capability', 'dependsOn', 'year2026', 'year2027', 'year2028'];

function UploadWizard({ onApply }: { onApply: (rows: Initiative[]) => void }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  return (
    <>
      <Button onClick={() => setOpen(true)}>Load .xlsx</Button>
      {open ? (
        <div>
          <input type='file' accept='.xlsx,.xls' onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError('');
            if (file.size > 5 * 1024 * 1024) {
              setError('File exceeds 5MB limit. Please upload a smaller workbook.');
              return;
            }
            if (!/\.xlsx?$/.test(file.name.toLowerCase())) {
              setError('Unsupported file format. Please upload a .xlsx or .xls file.');
              return;
            }
            const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellFormula: false, cellHTML: false });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
            setRows(json);
            const headers = Object.keys(json[0] ?? {});
            const auto = Object.fromEntries(headers.map((h) => [h, fields.find((f) => h.toLowerCase().replace(/\s+/g, '') === f.toLowerCase()) ?? '']));
            setMapping(auto);
          }} />
          {error ? <div>{error}</div> : null}
          {Object.keys(mapping).map((src) => (
            <div key={src}>
              <span>{src}</span>
              <Select value={mapping[src]} onChange={(v) => setMapping({ ...mapping, [src]: v })} options={[{ label: 'Ignore', value: '' }, ...fields.map((f) => ({ label: f, value: f }))]} />
            </div>
          ))}
          <Button variant='primary' onClick={() => {
            const mapped = rows.map((r) => {
              const out: Record<string, unknown> = {};
              Object.entries(mapping).forEach(([src, target]) => { if (target) out[target] = r[src]; });
              return {
                ...out,
                funded: String(out.funded).toLowerCase() === 'true' || String(out.fundingStatus).toLowerCase().includes('funded'),
                bcr: Number(out.bcr ?? 0), totalCapitalCost: Number(out.totalCapitalCost ?? 0), year2026: Number(out.year2026 ?? 0), year2027: Number(out.year2027 ?? 0), year2028: Number(out.year2028 ?? 0),
              } as Initiative;
            });
            onApply(mapped);
            setOpen(false);
          }}>Apply Mapping</Button>
        </div>
      ) : null}
    </>
  );
}

export default function App() {
  const [all, setAll] = useState<Initiative[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [weights, setWeights] = useState<Weights>(loadWeights(defaults as Weights));
  const [pendingFilters, setPendingFilters] = useState<Filters>(defaultFilters);
  const location = useLocation();

  useEffect(() => { loadDataset().then(setAll); }, []);
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);
  const options = (key: keyof Initiative) => Array.from(new Set(all.map((i) => String(i[key])))).sort();

  const activeFilterChips = [
    filters.portfolioName !== 'All' ? `Portfolio: ${filters.portfolioName}` : null,
    ...filters.valueStream.map((v) => `Value Stream: ${v}`),
    ...filters.fundingStatus.map((v) => `Funding: ${v}`),
    ...filters.driver.map((v) => `Driver: ${v}`),
    ...filters.recommendation.map((v) => `Recommendation: ${v}`),
    filters.bcrThreshold !== 'all' ? `BCR: ${filters.bcrThreshold}` : null,
    filters.search ? `Search: ${filters.search}` : null,
  ].filter(Boolean) as string[];

  return (
    <AppShell
      sidebar={<Sidebar items={navItems}><Select value={pendingFilters.portfolioName} onChange={(v) => setPendingFilters({ ...pendingFilters, portfolioName: v })} options={[{ label: 'All Portfolios', value: 'All' }, ...options('portfolioName').map((p) => ({ label: p, value: p }))]} /><MultiSelect value={pendingFilters.valueStream} onChange={(v) => setPendingFilters({ ...pendingFilters, valueStream: v })} options={options('valueStream').map((v) => ({ label: v, value: v }))} /><MultiSelect value={pendingFilters.fundingStatus} onChange={(v) => setPendingFilters({ ...pendingFilters, fundingStatus: v })} options={options('fundingStatus').map((v) => ({ label: v, value: v }))} /><MultiSelect value={pendingFilters.driver} onChange={(v) => setPendingFilters({ ...pendingFilters, driver: v })} options={options('driver').map((v) => ({ label: v, value: v }))} /><MultiSelect value={pendingFilters.recommendation} onChange={(v) => setPendingFilters({ ...pendingFilters, recommendation: v })} options={options('recommendation').map((v) => ({ label: v, value: v }))} /><Select value={pendingFilters.bcrThreshold} onChange={(v) => setPendingFilters({ ...pendingFilters, bcrThreshold: v as Filters['bcrThreshold'] })} options={[{ label: 'All BCR', value: 'all' }, { label: 'Has BCR', value: 'hasBcr' }, { label: '≥1.0', value: 'gte1' }, { label: '≥2.0', value: 'gte2' }, { label: '<1.0', value: 'lt1' }]} /><SearchField value={pendingFilters.search} onChange={(v) => setPendingFilters({ ...pendingFilters, search: v })} placeholder='Search initiatives' /><Button variant='primary' onClick={() => setFilters(pendingFilters)}>Run Analysis</Button></Sidebar>}
      topbar={<TopBar title='IT Portfolio Management'><Select value='Bundled Snapshot' onChange={() => undefined} options={[{ label: 'Bundled Snapshot', value: 'Bundled Snapshot' }, { label: 'Uploaded Workbook', value: 'Uploaded Workbook' }]} /><UploadWizard onApply={(rows) => { setAll(rows); saveDataset(rows); }} /><Button onClick={() => { resetDataset(); loadDataset().then(setAll); }}>Reset to bundled</Button><Button variant='primary' onClick={() => buildDeck(filtered.map((i) => scoreInitiative(i, weights)), findOverlapClusters(filtered))}>Generate Deck</Button><Button onClick={() => loadDataset().then(setAll)}>Refresh</Button></TopBar>}
    >
      <div>{activeFilterChips.map((chip) => <FilterChip key={chip} label={chip} onClear={() => setFilters(defaultFilters)} />)}</div>
      <Routes>
        <Route path='/' element={<Navigate to='/overview' replace />} />
        <Route path='/overview' element={<PortfolioOverview items={filtered} />} />
        <Route path='/funding-gap' element={<FundingGapAnalysis items={filtered} />} />
        <Route path='/value-stream' element={<ValueStreamDetail items={filtered} />} />
        <Route path='/register' element={<InitiativesRegister items={filtered} />} />
        <Route path='/decisions' element={<DecisionsOffsets items={filtered} />} />
        <Route path='/prioritization' element={<Prioritization items={filtered} weights={weights} onWeightsChange={setWeights} onSaveWeights={() => saveWeights(weights)} onResetWeights={() => setWeights(defaults as Weights)} />} />
      </Routes>
      <small>Current route: {location.pathname}</small>
    </AppShell>
  );
}
