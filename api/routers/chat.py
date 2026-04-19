import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Any

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    messages:   list[ChatMessage]
    prediction: dict[str, Any] | None = None


@router.post("/chat/stream")
def chat_stream(body: ChatStreamRequest):
    msgs = [m.model_dump() for m in body.messages]
    pred = body.prediction or {}

    def generate():
        try:
            from src.llm.chat import stream_response
            for chunk in stream_response(msgs, pred):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'chunk': f'⚠️ {e}', 'done': True})}\n\n"
            return
        yield f"data: {json.dumps({'chunk': '', 'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
