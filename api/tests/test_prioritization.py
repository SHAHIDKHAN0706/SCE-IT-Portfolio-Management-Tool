from src.prioritization.service import score_item
from src.prioritization.similarity import overlap_pairs


def test_score_item_range():
    result = score_item({'id': 'IT-1', 'bcr': 2.1, 'driver': 'Cyber-Compliance', 'funded': True, 'recommendation': 'CONTINUE', 'goLive': '2026-10-01', 'totalCapitalCost': 20, 'fundingStatus': 'Funded'})
    assert 0 <= result['priorityScore'] <= 100
    assert 'factorContributions' in result


def test_overlap_pairs_detects_similarity():
    items = [
        {'id': 'A', 'capability': 'IAM replatform', 'outcomes': 'identity modernization', 'classification': 'Platform', 'valueStream': 'Cybersecurity', 'ouSponsor': 'Cyber', 'driver': 'Cyber-Compliance'},
        {'id': 'B', 'capability': 'IAM replatform', 'outcomes': 'identity modernization', 'classification': 'Platform', 'valueStream': 'Cybersecurity', 'ouSponsor': 'Cyber', 'driver': 'Cyber-Compliance'},
    ]
    pairs = overlap_pairs(items, threshold=0.55)
    assert pairs and pairs[0][0] == 'A'
