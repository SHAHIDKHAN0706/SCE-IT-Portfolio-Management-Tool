from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def overlap_pairs(items: list[dict], threshold: float = 0.55) -> list[tuple[str, str, float]]:
    text = [f"{i.get('capability', '')} {i.get('outcomes', '')} {i.get('classification', '')}" for i in items]
    matrix = TfidfVectorizer().fit_transform(text)
    sim = cosine_similarity(matrix)
    pairs: list[tuple[str, str, float]] = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            score = float(sim[i, j])
            if items[i].get('valueStream') == items[j].get('valueStream'):
                score += 0.15
            if items[i].get('ouSponsor') == items[j].get('ouSponsor'):
                score += 0.10
            if items[i].get('driver') == items[j].get('driver'):
                score += 0.10
            if score >= threshold:
                pairs.append((str(items[i].get('id')), str(items[j].get('id')), round(score, 3)))
    return pairs
