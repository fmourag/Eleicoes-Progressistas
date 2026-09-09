from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import os

from app.algorithm.core import rank_by_pillars

app = FastAPI(title="NP Matching Service (Stateless)", version="2.2.0")

API_KEY = os.getenv("API_KEY", "")


class CandidateProfile(BaseModel):
    id: Optional[str] = None
    candidate_id: Optional[str] = None
    tse_id: Optional[str] = None
    name: Optional[str] = ""
    party: Optional[str] = ""
    ficha_limpa: bool = False
    pillar_focus: Optional[Dict[str, float]] = None
    profile_scores: Optional[Dict[str, float]] = None


class RankRequest(BaseModel):
    candidate_scores: Optional[Dict[str, float]] = None
    candidate: Optional[CandidateProfile] = None
    priority_pillars: Optional[List[str]] = None
    ficha_limpa: bool = False


class RankResponse(BaseModel):
    score: float
    match_score: float
    match_reason: str
    is_estimated: bool
    priority_aligned: List[str]


class BatchRankRequest(BaseModel):
    priority_pillars: Optional[List[str]] = None
    candidates: List[Union[CandidateProfile, Dict[str, Any]]]


class BatchCandidateResult(BaseModel):
    candidate_id: str
    candidate_name: str
    match_score: float
    score: float
    match_reason: str
    is_estimated: bool
    priority_aligned: List[str]


class BatchRankResponse(BaseModel):
    results: List[BatchCandidateResult]


def verify_api_key(x_api_key: str = Header(default="")):
    if not API_KEY or x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/matching/rank", response_model=RankResponse)
async def rank(req: RankRequest, x_api_key: str = Header(default="")):
    verify_api_key(x_api_key)

    cand_dict: Dict[str, float] = {}
    ficha_limpa = req.ficha_limpa
    priorities = req.priority_pillars or []

    if req.candidate:
        cand_dict = req.candidate.pillar_focus or req.candidate.profile_scores or {}
        ficha_limpa = req.candidate.ficha_limpa
    elif req.candidate_scores:
        cand_dict = req.candidate_scores

    score, reason, is_estimated, aligned = rank_by_pillars(
        candidate=cand_dict,
        priority_pillars=priorities,
        ficha_limpa=ficha_limpa,
    )

    return RankResponse(
        score=score,
        match_score=score,
        match_reason=reason,
        is_estimated=is_estimated,
        priority_aligned=aligned,
    )


@app.post("/matching/batch", response_model=BatchRankResponse)
async def batch_rank(req: BatchRankRequest, x_api_key: str = Header(default="")):
    verify_api_key(x_api_key)

    priority_pillars: List[str] = req.priority_pillars or []
    results: List[BatchCandidateResult] = []

    for c in req.candidates:
        c_dict = c.dict() if hasattr(c, "dict") else (c if isinstance(c, dict) else {})

        cand_id = str(c_dict.get("id") or c_dict.get("candidate_id") or "")
        cand_name = str(c_dict.get("name") or c_dict.get("candidate_name") or "")
        ficha_limpa = bool(c_dict.get("ficha_limpa", False))
        pillar_focus = c_dict.get("pillar_focus") or c_dict.get("profile_scores")

        score, reason, is_estimated, aligned = rank_by_pillars(
            candidate=pillar_focus,
            priority_pillars=priority_pillars,
            ficha_limpa=ficha_limpa,
        )

        results.append(
            BatchCandidateResult(
                candidate_id=cand_id,
                candidate_name=cand_name,
                match_score=score,
                score=score,
                match_reason=reason,
                is_estimated=is_estimated,
                priority_aligned=aligned,
            )
        )

    results.sort(key=lambda x: x.match_score, reverse=True)
    return BatchRankResponse(results=results)
