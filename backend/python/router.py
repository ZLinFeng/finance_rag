from fastapi import APIRouter
from pydantic import BaseModel
from ner_service import ner_service
from std_service import std_service

router = APIRouter(prefix="/api")


class NerRequest(BaseModel):
    text: str


class NerResponse(BaseModel):
    text: str
    type: str
    start: int
    end: int
    confidence: float
    

class StdResponse(BaseModel):
    original: str
    standard: str
    start: int
    end: int
    confidence: float


@router.post("/ner")
async def ner(request: NerRequest):
    ner_res = ner_service.extract_entities(request.text)
    content = request.text
    response = []
    for item in ner_res:
        value = item["entity_value"]
        start = content.find(value)
        end = start + len(value)
        response.append(
            NerResponse(
                text=value,
                type=item["entity_type"],
                start=start,
                end=end,
                confidence=item["confidence"],
            )
        )
    return response


@router.post("/std")
async def std(request: NerRequest):
    ner_res = ner_service.extract_entities(request.text)
    
    for item in ner_res:
        pass
    content = request.text
    response = []
    for item in ner_res:
        value = item["entity_value"]
        start = content.find(value)
        end = start + len(value)
        std_res, distance = std_service.std(value)
        if std_res:
            response.append(
            StdResponse(
                original=value,
                standard=std_res,
                start=start,
                end=end,
                confidence=distance,
            )
        )
    return response
