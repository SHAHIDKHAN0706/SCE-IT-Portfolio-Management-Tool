from __future__ import annotations

from datetime import date

DEFAULT_WEIGHTS = {
    'bcr': 0.25,
    'driverUrgency': 0.20,
    'fundingPressure': 0.15,
    'strategicAlignment': 0.15,
    'timeToGoLive': 0.10,
    'capitalEfficiency': 0.10,
    'recommendationSignal': 0.05,
}

DRIVER_URGENCY = {
    'Cyber-Compliance': 1.0,
    'Technology Obsolescence': 0.85,
    'Multi-Driver': 0.75,
    'Strategy': 0.7,
    'Business Need': 0.55,
    'Other': 0.3,
}


def _clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def _norm_weights(weights: dict[str, float]) -> dict[str, float]:
    total = sum(weights.values()) or 1.0
    return {k: v / total for k, v in weights.items()}


def score_item(item: dict, weights: dict[str, float] | None = None) -> dict:
    weights = _norm_weights(weights or DEFAULT_WEIGHTS)
    go_live = date.fromisoformat(str(item.get('goLive', '2028-01-01')))
    months = max(1, (go_live.year - date.today().year) * 12 + (go_live.month - date.today().month))
    factors = {
        'bcr': _clamp(float(item.get('bcr', 0)) / 3),
        'driverUrgency': DRIVER_URGENCY.get(item.get('driver', 'Other'), 0.3),
        'fundingPressure': 1.0 if item.get('funded') else (0.5 if item.get('fundingStatus') == 'Partially Funded' else 0.0),
        'strategicAlignment': 1.0 if item.get('driver') in {'Cyber-Compliance', 'Strategy'} else 0.6,
        'timeToGoLive': _clamp(1 - months / 48),
        'capitalEfficiency': _clamp(1 - float(item.get('totalCapitalCost', 0)) / 120),
        'recommendationSignal': {'CONTINUE': 1, 'DELAY': 0.5, 'CANCEL': 0, 'REDUCE SCOPE': 0.4}.get(item.get('recommendation', 'DELAY'), 0.5),
    }
    score = 100 * sum(factors[k] * weights[k] for k in factors)
    result = dict(item)
    result['factorContributions'] = factors
    result['priorityScore'] = round(score, 1)
    return result
