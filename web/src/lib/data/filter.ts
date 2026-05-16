import type { Filters, Initiative } from '../../types/model';

export const defaultFilters: Filters = {
  portfolioName: 'All',
  valueStream: [],
  fundingStatus: [],
  driver: [],
  recommendation: [],
  bcrThreshold: 'all',
  search: '',
};

export function applyFilters(items: Initiative[], filters: Filters) {
  return items.filter((i) => {
    if (filters.portfolioName !== 'All' && i.portfolioName !== filters.portfolioName) return false;
    if (filters.valueStream.length && !filters.valueStream.includes(i.valueStream)) return false;
    if (filters.fundingStatus.length && !filters.fundingStatus.includes(i.fundingStatus)) return false;
    if (filters.driver.length && !filters.driver.includes(i.driver)) return false;
    if (filters.recommendation.length && !filters.recommendation.includes(i.recommendation)) return false;
    if (filters.bcrThreshold === 'hasBcr' && !i.bcr) return false;
    if (filters.bcrThreshold === 'gte1' && i.bcr < 1) return false;
    if (filters.bcrThreshold === 'gte2' && i.bcr < 2) return false;
    if (filters.bcrThreshold === 'lt1' && i.bcr >= 1) return false;
    if (filters.search && !`${i.id} ${i.name} ${i.outcomes}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
