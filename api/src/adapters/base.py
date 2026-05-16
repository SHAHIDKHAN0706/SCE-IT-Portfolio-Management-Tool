from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class PortfolioDataAdapter(ABC):
    @abstractmethod
    def load_data(self, **kwargs: Any) -> list[dict[str, Any]]:
        raise NotImplementedError
