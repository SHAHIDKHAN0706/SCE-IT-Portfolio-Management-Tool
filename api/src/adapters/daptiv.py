from __future__ import annotations

from .base import PortfolioDataAdapter


class DaptivAdapter(PortfolioDataAdapter):
    def load_data(self, **kwargs):
        raise NotImplementedError('TODO: implement Daptiv API integration and field mapping to canonical model')
