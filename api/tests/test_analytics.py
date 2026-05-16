from src.analytics.metrics import summarize_portfolio


def test_summarize_portfolio():
    result = summarize_portfolio([
        {'funded': True, 'totalCapitalCost': 10, 'bcr': 2.0},
        {'funded': False, 'totalCapitalCost': 20, 'bcr': 1.0},
    ])
    assert result['count'] == 2
    assert result['funded_count'] == 1
    assert result['total_capital'] == 30
    assert result['avg_bcr'] == 1.5
