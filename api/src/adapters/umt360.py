from __future__ import annotations

from .base import PortfolioDataAdapter


class UMT360Adapter(PortfolioDataAdapter):
    def load_data(self, **kwargs):
        raise NotImplementedError('TODO: implement UMT360 API integration and field mapping to canonical model')
