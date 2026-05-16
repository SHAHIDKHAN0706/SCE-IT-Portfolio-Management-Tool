from __future__ import annotations

from fastapi import FastAPI, Response
from pydantic import BaseModel

from analytics import summarize_portfolio
from prioritization.service import score_item
from ppt.build_deck import build_executive_deck

app = FastAPI(title='SCE IT Portfolio API')


class ScoreRequest(BaseModel):
    item: dict


class DeckRequest(BaseModel):
    items: list[dict]


@app.get('/healthz')
def healthz():
    return {'status': 'ok'}


@app.post('/api/prioritization/score')
def score(req: ScoreRequest):
    return score_item(req.item)


@app.post('/api/analytics/summary')
def summary(payload: DeckRequest):
    return summarize_portfolio(payload.items)


@app.post('/api/decks/executive')
def deck(payload: DeckRequest):
    data = build_executive_deck(payload.items)
    return Response(content=data, media_type='application/vnd.openxmlformats-officedocument.presentationml.presentation')
