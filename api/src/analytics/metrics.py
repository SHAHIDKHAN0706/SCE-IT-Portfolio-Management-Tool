from __future__ import annotations


def summarize_portfolio(items: list[dict]) -> dict:
    total_capital = sum(float(i.get('totalCapitalCost', 0)) for i in items)
    funded = sum(1 for i in items if bool(i.get('funded')))
    avg_bcr = (sum(float(i.get('bcr', 0)) for i in items) / len(items)) if items else 0
    return {
        'count': len(items),
        'funded_count': funded,
        'total_capital': round(total_capital, 2),
        'avg_bcr': round(avg_bcr, 2),
    }
