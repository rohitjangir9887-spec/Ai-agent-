"""Anonymous NVIDIA NIM chat only: no files, tools, terminal, or agent access.

The browser supplies its OWN NVIDIA API key for each message. No server token
or app account is necessary for this limited chat endpoint. The main agent API
remains authenticated, and the key is never saved or logged here.
"""

from __future__ import annotations

import asyncio
import re
import time
from collections import deque
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"
_MODEL_PATTERN = re.compile(r"^[a-zA-Z0-9_./-]{3,128}$")
_INFLIGHT = asyncio.Semaphore(4)
_CALLS: dict[str, deque[float]] = {}


class GuestMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=6000)


class GuestNimRequest(BaseModel):
    api_key: str = Field(min_length=12, max_length=320)
    model: str = Field(default="nvidia/nemotron-3-ultra-550b-a55b", min_length=3, max_length=128)
    messages: list[GuestMessage] = Field(min_length=1, max_length=14)


def install_guest_nim(app: FastAPI) -> None:
    """Only this separate model-chat route is public; no control endpoints are."""

    @app.post("/api/guest/nim", include_in_schema=False)
    async def chat(body: GuestNimRequest, request: Request) -> dict[str, str]:
        key = body.api_key.strip()
        if not key.startswith("nvapi-") or not _MODEL_PATTERN.fullmatch(body.model):
            raise HTTPException(status_code=400, detail="Use a valid NVIDIA NIM API key and model ID.")
        if body.messages[-1].role != "user":
            raise HTTPException(status_code=400, detail="Your last message must be from the user.")

        # Small, fixed-size IP limit reduces abuse of the public proxy. Do not
        # trust unverified X-Forwarded-For headers in client-provided requests.
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        if len(_CALLS) > 500:
            for old_ip, calls in list(_CALLS.items()):
                if not calls or calls[-1] < now - 70:
                    _CALLS.pop(old_ip, None)
        calls = _CALLS.setdefault(ip, deque(maxlen=20))
        while calls and calls[0] < now - 60:
            calls.popleft()
        if len(calls) >= 12:
            raise HTTPException(status_code=429, detail="Too many requests. Please try again in a minute.")
        calls.append(now)

        data = {
            "model": body.model,
            "messages": [msg.model_dump() for msg in body.messages],
            "stream": False,
            "max_tokens": 1024,
            "temperature": 0.65,
        }
        try:
            async with _INFLIGHT:
                async with httpx.AsyncClient(timeout=65.0, follow_redirects=False) as client:
                    response = await client.post(
                        _ENDPOINT,
                        json=data,
                        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    )
        except (httpx.TimeoutException, httpx.TransportError):
            raise HTTPException(status_code=502, detail="NVIDIA NIM could not be reached.") from None

        if response.status_code in (401, 403):
            raise HTTPException(status_code=401, detail="NVIDIA key rejected. Create a new key at build.nvidia.com.")
        if response.status_code == 429:
            raise HTTPException(status_code=429, detail="NVIDIA NIM rate limit reached.")
        if not response.is_success:
            raise HTTPException(
                status_code=502,
                detail=f"NVIDIA request failed (provider HTTP {response.status_code}). Check the model ID.",
            )
        try:
            payload = response.json()
            answer = payload["choices"][0]["message"]["content"]
            if not isinstance(answer, str):
                raise ValueError("Missing response text")
        except (KeyError, IndexError, TypeError, ValueError):
            raise HTTPException(status_code=502, detail="NVIDIA returned an unsupported response.") from None
        return {"reply": answer}
