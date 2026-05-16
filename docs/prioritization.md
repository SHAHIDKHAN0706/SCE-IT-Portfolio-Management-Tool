# Prioritization Module

## Scoring

Weights live in `web/src/lib/prioritization/weights.json` and are editable via slider controls in the Prioritization view.

## Similarity / overlap

Client side: lightweight TF-IDF + cosine on `capability + outcomes + classification`.
Rule boosts:

- +0.15 same value stream
- +0.10 same OU sponsor
- +0.10 same driver

Above-threshold pairs are clustered via union-find.

## Interdependency graph

Edges are built by:

- shared OU sponsor
- shared funding source
- capability token Jaccard >= 0.4
- explicit `dependsOn`
