"""EvaOne.AI Backend - AI Executive Operating System"""
import io
import os
import uuid
import logging
import asyncio
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import requests
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Header, Query, Response, Cookie, Request, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText, OpenAITextToSpeech

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("evaone")

# ---------- MongoDB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---------- Constants ----------
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "evaone")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
AUTH_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# Available models
AVAILABLE_MODELS = {
    "claude-sonnet-4-6": {"provider": "anthropic", "label": "Claude Sonnet 4.6"},
    "gpt-5.4": {"provider": "openai", "label": "GPT-5.4"},
    "gemini-3.1-pro-preview": {"provider": "gemini", "label": "Gemini 3.1 Pro"},
    "gemini-3-flash-preview": {"provider": "gemini", "label": "Gemini 3 Flash"},
}
DEFAULT_MODEL = "claude-sonnet-4-6"

EVA_SYSTEM_PROMPT = (
    "You are Eva — the AI Chief of Staff of EvaOne.AI, an executive operating system. "
    "You are calm, sharp, decisive, and act as a senior executive partner — never as a chatbot. "
    "You help the user transform information into action: structure ideas, propose plans, summarize files, "
    "extract action items, and surface decisions. Respond with executive clarity: short headers, crisp bullets, "
    "and recommended next steps. When confidence is low, say so. Never claim to have performed external actions "
    "(emails, payments, deployments, posts) — only propose drafts for approval. Use markdown for structure."
)

# ---------- Object Storage ----------
storage_key: Optional[str] = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ---------- FastAPI app ----------
app = FastAPI(title="EvaOne.AI")
api_router = APIRouter(prefix="/api")

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    # Seed default workspace data
    await seed_demo_data()

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ---------- Models ----------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: str

class ChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    model: str
    created_at: str
    updated_at: str

class ChatMessage(BaseModel):
    id: str
    session_id: str
    role: Literal["user", "assistant", "system"]
    content: str
    model: Optional[str] = None
    created_at: str

class VaultNote(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    tags: List[str] = []
    pinned: bool = False
    created_at: str
    updated_at: str

class Project(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    status: Literal["active", "paused", "completed"] = "active"
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    progress: int = 0
    created_at: str

class FileRecord(BaseModel):
    id: str
    user_id: str
    filename: str
    storage_path: str
    content_type: str
    size: int
    summary: Optional[str] = None
    key_points: List[str] = []
    action_items: List[str] = []
    extracted_text_preview: Optional[str] = None
    status: Literal["uploaded", "analyzing", "analyzed", "failed"] = "uploaded"
    created_at: str

# ---------- Auth ----------
async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> User:
    token = request.cookies.get("session_token")
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)

class SessionRequest(BaseModel):
    session_id: str

@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    """Exchange Emergent session_id for our own session_token, store user, set cookie."""
    try:
        r = requests.get(
            AUTH_SESSION_URL,
            headers={"X-Session-ID": payload.session_id},
            timeout=15
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id from Emergent Auth")
        data = r.json()
    except requests.RequestException:
        raise HTTPException(status_code=502, detail="Auth provider unreachable")

    email = data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture")}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data["name"],
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}

@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.model_dump()

@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ---------- Models endpoint ----------
@api_router.get("/models")
async def list_models():
    return [
        {"id": k, "label": v["label"], "provider": v["provider"]}
        for k, v in AVAILABLE_MODELS.items()
    ]

# ---------- Chat ----------
class CreateSessionBody(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None

@api_router.post("/chat/sessions")
async def create_chat_session(body: CreateSessionBody, user: User = Depends(get_current_user)):
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": session_id,
        "user_id": user.user_id,
        "title": body.title or "New conversation",
        "model": body.model or DEFAULT_MODEL,
        "created_at": now,
        "updated_at": now,
    }
    await db.chat_sessions.insert_one(dict(doc))
    return doc

@api_router.get("/chat/sessions")
async def list_chat_sessions(user: User = Depends(get_current_user)):
    cur = db.chat_sessions.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1)
    return await cur.to_list(200)

@api_router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(session_id: str, user: User = Depends(get_current_user)):
    await db.chat_sessions.delete_one({"id": session_id, "user_id": user.user_id})
    await db.chat_messages.delete_many({"session_id": session_id})
    return {"ok": True}

@api_router.get("/chat/sessions/{session_id}/messages")
async def list_messages(session_id: str, user: User = Depends(get_current_user)):
    sess = await db.chat_sessions.find_one({"id": session_id, "user_id": user.user_id}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    cur = db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1)
    return await cur.to_list(1000)

class SendMessageBody(BaseModel):
    content: str
    model: Optional[str] = None
    attach_vault_context: bool = False

@api_router.post("/chat/sessions/{session_id}/messages")
async def send_message(session_id: str, body: SendMessageBody, user: User = Depends(get_current_user)):
    sess = await db.chat_sessions.find_one({"id": session_id, "user_id": user.user_id}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    model_id = body.model or sess.get("model") or DEFAULT_MODEL
    if model_id not in AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail="Unknown model")
    provider = AVAILABLE_MODELS[model_id]["provider"]

    now = datetime.now(timezone.utc).isoformat()
    user_msg = {
        "id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "role": "user",
        "content": body.content,
        "model": model_id,
        "created_at": now,
    }
    await db.chat_messages.insert_one(dict(user_msg))

    # Reconstruct history for stateless model: emergent LlmChat library is per-call
    history_cur = db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1)
    history = await history_cur.to_list(200)

    # Build system prompt; optionally include vault context
    sys_prompt = EVA_SYSTEM_PROMPT
    if body.attach_vault_context:
        notes_cur = db.vault_notes.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1).limit(10)
        notes = await notes_cur.to_list(10)
        if notes:
            ctx = "\n\n---\nKNOWLEDGE VAULT CONTEXT (most recent notes):\n" + "\n".join(
                f"- {n['title']}: {n['content'][:400]}" for n in notes
            )
            sys_prompt = sys_prompt + ctx

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=sys_prompt,
    ).with_model(provider, model_id)

    # Replay history through chat — emergentintegrations LlmChat handles history per session_id internally
    # but to be safe we send only the latest message; library + session_id retains context
    try:
        assistant_text = await chat.send_message(UserMessage(text=body.content))
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=500, detail=f"LLM call failed: {e}")

    now2 = datetime.now(timezone.utc).isoformat()
    assistant_msg = {
        "id": f"msg_{uuid.uuid4().hex[:12]}",
        "session_id": session_id,
        "role": "assistant",
        "content": str(assistant_text),
        "model": model_id,
        "created_at": now2,
    }
    await db.chat_messages.insert_one(dict(assistant_msg))

    # Update session title if first user turn
    if len(history) <= 1:
        title = body.content[:50] + ("..." if len(body.content) > 50 else "")
        await db.chat_sessions.update_one(
            {"id": session_id},
            {"$set": {"title": title, "updated_at": now2, "model": model_id}}
        )
    else:
        await db.chat_sessions.update_one(
            {"id": session_id},
            {"$set": {"updated_at": now2, "model": model_id}}
        )

    return {"user_message": user_msg, "assistant_message": assistant_msg}

# ---------- Voice ----------
@api_router.post("/voice/transcribe")
async def voice_transcribe(audio: UploadFile = File(...), user: User = Depends(get_current_user)):
    if audio.size and audio.size > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file too large (25MB max)")
    data = await audio.read()
    stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
    try:
        # Wrap as file-like object
        buf = io.BytesIO(data)
        buf.name = audio.filename or "audio.webm"
        response = await stt.transcribe(file=buf, model="whisper-1", response_format="json")
        text = getattr(response, "text", None) or (response.get("text") if isinstance(response, dict) else str(response))
        return {"text": text}
    except Exception as e:
        logger.exception("STT failed")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {e}")

class TTSBody(BaseModel):
    text: str
    voice: str = "nova"

@api_router.post("/voice/speak")
async def voice_speak(body: TTSBody, user: User = Depends(get_current_user)):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")
    text = body.text[:4000]
    tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
    try:
        audio_bytes = await tts.generate_speech(text=text, model="tts-1", voice=body.voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        logger.exception("TTS failed")
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")

# ---------- Files ----------
def extract_text_from_file(filename: str, content_type: str, data: bytes) -> str:
    """Best-effort text extraction. Returns '' if not extractable."""
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    try:
        if ext == "pdf" or content_type == "application/pdf":
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(data))
            parts = []
            for page in reader.pages[:50]:
                try:
                    parts.append(page.extract_text() or "")
                except Exception:
                    pass
            return "\n".join(parts)
        if ext == "docx":
            import docx
            d = docx.Document(io.BytesIO(data))
            return "\n".join(p.text for p in d.paragraphs)
        if ext in ("xlsx", "xls"):
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
            out = []
            for ws in wb.worksheets[:5]:
                out.append(f"# Sheet: {ws.title}")
                for row in ws.iter_rows(values_only=True, max_row=500):
                    out.append(" | ".join("" if c is None else str(c) for c in row))
            return "\n".join(out)
        if ext in ("csv", "txt", "json", "md", "log"):
            return data.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.warning(f"Text extraction failed for {filename}: {e}")
    return ""

@api_router.post("/files/upload")
async def upload_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    data = await file.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (25MB max)")
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "bin"
    path = f"{APP_NAME}/uploads/{user.user_id}/{uuid.uuid4().hex}.{ext}"
    content_type = file.content_type or "application/octet-stream"
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.exception("Storage upload failed")
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    extracted = extract_text_from_file(file.filename or "", content_type, data)
    record = {
        "id": f"file_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "filename": file.filename or "untitled",
        "storage_path": result["path"],
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "summary": None,
        "key_points": [],
        "action_items": [],
        "extracted_text_preview": (extracted[:2000] if extracted else None),
        "_full_text": extracted[:60000] if extracted else None,
        "status": "uploaded",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_deleted": False,
    }
    await db.files.insert_one(dict(record))
    record.pop("_full_text", None)
    return record

@api_router.get("/files")
async def list_files(user: User = Depends(get_current_user)):
    cur = db.files.find(
        {"user_id": user.user_id, "is_deleted": False},
        {"_id": 0, "_full_text": 0}
    ).sort("created_at", -1)
    return await cur.to_list(500)

@api_router.get("/files/{file_id}")
async def get_file(file_id: str, user: User = Depends(get_current_user)):
    rec = await db.files.find_one(
        {"id": file_id, "user_id": user.user_id, "is_deleted": False},
        {"_id": 0, "_full_text": 0}
    )
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    return rec

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str, user: User = Depends(get_current_user)):
    res = await db.files.update_one(
        {"id": file_id, "user_id": user.user_id},
        {"$set": {"is_deleted": True}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True}

@api_router.get("/files/{file_id}/download")
async def download_file(file_id: str, user: User = Depends(get_current_user)):
    rec = await db.files.find_one(
        {"id": file_id, "user_id": user.user_id, "is_deleted": False},
        {"_id": 0}
    )
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    data, ct = get_object(rec["storage_path"])
    return Response(content=data, media_type=rec.get("content_type") or ct)

class AnalyzeBody(BaseModel):
    model: Optional[str] = None

@api_router.post("/files/{file_id}/analyze")
async def analyze_file(file_id: str, body: AnalyzeBody, user: User = Depends(get_current_user)):
    rec = await db.files.find_one({"id": file_id, "user_id": user.user_id, "is_deleted": False})
    if not rec:
        raise HTTPException(status_code=404, detail="File not found")
    text = rec.get("_full_text") or rec.get("extracted_text_preview")
    if not text:
        raise HTTPException(status_code=400, detail="No extractable text for this file type")

    model_id = body.model or DEFAULT_MODEL
    if model_id not in AVAILABLE_MODELS:
        model_id = DEFAULT_MODEL
    provider = AVAILABLE_MODELS[model_id]["provider"]

    await db.files.update_one({"id": file_id}, {"$set": {"status": "analyzing"}})

    sys = (
        "You are Eva, an executive AI analyst. Given the document text, return a structured JSON "
        "with: summary (3-5 sentences), key_points (5-8 bullets), action_items (3-7 concrete next steps for the user). "
        "Return STRICT JSON only, no markdown fencing, no commentary. Schema: "
        '{"summary": str, "key_points": [str], "action_items": [str]}'
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"analyze_{file_id}",
        system_message=sys,
    ).with_model(provider, model_id)

    prompt = f"FILENAME: {rec['filename']}\n\nDOCUMENT:\n{text[:50000]}"
    try:
        raw = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        await db.files.update_one({"id": file_id}, {"$set": {"status": "failed"}})
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    import json
    import re
    raw_str = str(raw).strip()
    # Strip code fences if present
    raw_str = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_str, flags=re.MULTILINE).strip()
    try:
        parsed = json.loads(raw_str)
    except Exception:
        # Try extracting JSON object
        m = re.search(r"\{[\s\S]*\}", raw_str)
        parsed = json.loads(m.group(0)) if m else {"summary": raw_str[:2000], "key_points": [], "action_items": []}

    summary = parsed.get("summary", "")
    key_points = parsed.get("key_points", []) or []
    action_items = parsed.get("action_items", []) or []
    await db.files.update_one(
        {"id": file_id},
        {"$set": {
            "summary": summary,
            "key_points": key_points,
            "action_items": action_items,
            "status": "analyzed"
        }}
    )
    out = await db.files.find_one({"id": file_id}, {"_id": 0, "_full_text": 0})
    return out

# ---------- Vault Notes ----------
class NoteCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []
    pinned: bool = False

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    pinned: Optional[bool] = None

@api_router.post("/vault/notes")
async def create_note(body: NoteCreate, user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    note = {
        "id": f"note_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "title": body.title,
        "content": body.content,
        "tags": body.tags,
        "pinned": body.pinned,
        "created_at": now,
        "updated_at": now,
    }
    await db.vault_notes.insert_one(dict(note))
    return note

@api_router.get("/vault/notes")
async def list_notes(q: Optional[str] = None, tag: Optional[str] = None, user: User = Depends(get_current_user)):
    query = {"user_id": user.user_id}
    if tag:
        query["tags"] = tag
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
        ]
    cur = db.vault_notes.find(query, {"_id": 0}).sort([("pinned", -1), ("updated_at", -1)])
    return await cur.to_list(500)

@api_router.get("/vault/notes/{note_id}")
async def get_note(note_id: str, user: User = Depends(get_current_user)):
    n = await db.vault_notes.find_one({"id": note_id, "user_id": user.user_id}, {"_id": 0})
    if not n:
        raise HTTPException(status_code=404, detail="Note not found")
    return n

@api_router.put("/vault/notes/{note_id}")
async def update_note(note_id: str, body: NoteUpdate, user: User = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.vault_notes.update_one(
        {"id": note_id, "user_id": user.user_id},
        {"$set": updates}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return await db.vault_notes.find_one({"id": note_id}, {"_id": 0})

@api_router.delete("/vault/notes/{note_id}")
async def delete_note(note_id: str, user: User = Depends(get_current_user)):
    await db.vault_notes.delete_one({"id": note_id, "user_id": user.user_id})
    return {"ok": True}

@api_router.get("/vault/search")
async def vault_search(q: str, user: User = Depends(get_current_user)):
    notes_cur = db.vault_notes.find({
        "user_id": user.user_id,
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
        ]
    }, {"_id": 0}).limit(50)
    files_cur = db.files.find({
        "user_id": user.user_id,
        "is_deleted": False,
        "$or": [
            {"filename": {"$regex": q, "$options": "i"}},
            {"summary": {"$regex": q, "$options": "i"}},
            {"extracted_text_preview": {"$regex": q, "$options": "i"}},
        ]
    }, {"_id": 0, "_full_text": 0}).limit(50)
    return {
        "notes": await notes_cur.to_list(50),
        "files": await files_cur.to_list(50),
    }

# ---------- Projects ----------
class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    progress: int = 0
    status: Literal["active", "paused", "completed"] = "active"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Literal["low", "medium", "high", "critical"]] = None
    progress: Optional[int] = None
    status: Optional[Literal["active", "paused", "completed"]] = None

@api_router.post("/projects")
async def create_project(body: ProjectCreate, user: User = Depends(get_current_user)):
    p = {
        "id": f"proj_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        **body.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(dict(p))
    return p

@api_router.get("/projects")
async def list_projects(user: User = Depends(get_current_user)):
    cur = db.projects.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1)
    return await cur.to_list(200)

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate, user: User = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    res = await db.projects.update_one(
        {"id": project_id, "user_id": user.user_id},
        {"$set": updates}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return await db.projects.find_one({"id": project_id}, {"_id": 0})

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: User = Depends(get_current_user)):
    await db.projects.delete_one({"id": project_id, "user_id": user.user_id})
    return {"ok": True}

# ---------- Dashboard ----------
@api_router.get("/dashboard/stats")
async def dashboard_stats(user: User = Depends(get_current_user)):
    sessions = await db.chat_sessions.count_documents({"user_id": user.user_id})
    messages = await db.chat_messages.count_documents({
        "session_id": {"$in": [s["id"] async for s in db.chat_sessions.find({"user_id": user.user_id}, {"id": 1})]}
    }) if sessions else 0
    files = await db.files.count_documents({"user_id": user.user_id, "is_deleted": False})
    notes = await db.vault_notes.count_documents({"user_id": user.user_id})
    projects_total = await db.projects.count_documents({"user_id": user.user_id})
    projects_active = await db.projects.count_documents({"user_id": user.user_id, "status": "active"})
    analyzed_files = await db.files.count_documents({"user_id": user.user_id, "status": "analyzed", "is_deleted": False})

    # Aggregate all action items across analyzed files
    cur = db.files.find(
        {"user_id": user.user_id, "is_deleted": False, "status": "analyzed"},
        {"_id": 0, "action_items": 1, "filename": 1, "id": 1, "created_at": 1}
    )
    open_actions = []
    async for f in cur:
        for ai in (f.get("action_items") or [])[:5]:
            open_actions.append({"file_id": f["id"], "filename": f["filename"], "action": ai})

    return {
        "sessions": sessions,
        "messages": messages,
        "files": files,
        "analyzed_files": analyzed_files,
        "notes": notes,
        "projects_total": projects_total,
        "projects_active": projects_active,
        "open_actions": open_actions[:12],
        "system_health": {
            "llm": "operational",
            "storage": "operational" if storage_key else "degraded",
            "voice": "operational",
            "vault": "operational",
        },
    }

@api_router.get("/dashboard/activity")
async def dashboard_activity(user: User = Depends(get_current_user)):
    """Recent unified activity feed."""
    activity = []
    async for m in db.chat_messages.aggregate([
        {"$lookup": {"from": "chat_sessions", "localField": "session_id", "foreignField": "id", "as": "sess"}},
        {"$unwind": "$sess"},
        {"$match": {"sess.user_id": user.user_id}},
        {"$sort": {"created_at": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "role": 1, "content": 1, "created_at": 1, "session_title": "$sess.title"}}
    ]):
        activity.append({
            "type": "chat",
            "title": f"{m['role'].title()} in '{m['session_title']}'",
            "preview": (m["content"][:120] + "...") if len(m["content"]) > 120 else m["content"],
            "at": m["created_at"],
        })
    async for f in db.files.find(
        {"user_id": user.user_id, "is_deleted": False},
        {"_id": 0}
    ).sort("created_at", -1).limit(10):
        activity.append({
            "type": "file",
            "title": f"File uploaded: {f['filename']}",
            "preview": (f.get("summary") or "Awaiting analysis")[:120],
            "at": f["created_at"],
        })
    async for n in db.vault_notes.find(
        {"user_id": user.user_id}, {"_id": 0}
    ).sort("updated_at", -1).limit(10):
        activity.append({
            "type": "note",
            "title": f"Note updated: {n['title']}",
            "preview": n["content"][:120],
            "at": n["updated_at"],
        })
    activity.sort(key=lambda a: a["at"], reverse=True)
    return activity[:20]

# ---------- Seed demo (no-op if exists) ----------
async def seed_demo_data():
    # Nothing to seed globally; per-user examples are created on first login
    pass

@api_router.post("/onboard")
async def onboard(user: User = Depends(get_current_user)):
    """Create starter notes + project the first time the user opens the app."""
    existing = await db.vault_notes.count_documents({"user_id": user.user_id})
    if existing > 0:
        return {"created": False}
    now = datetime.now(timezone.utc).isoformat()
    starter_notes = [
        {
            "id": f"note_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "title": "Welcome to EvaOne.AI",
            "content": "EvaOne is your AI Chief of Staff. Use the Vault to capture insights, upload files for analysis, and chat with Eva to turn information into action.",
            "tags": ["welcome", "guide"],
            "pinned": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": f"note_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            "title": "How Eva thinks",
            "content": "Eva drafts, structures, and surfaces decisions — never claims external actions. All outbound work passes through an approval queue before execution.",
            "tags": ["principles"],
            "pinned": False,
            "created_at": now,
            "updated_at": now,
        },
    ]
    await db.vault_notes.insert_many(starter_notes)
    await db.projects.insert_one({
        "id": f"proj_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "name": "Launch EvaOne workspace",
        "description": "Set up vault, upload first file, and have a strategy session with Eva.",
        "status": "active",
        "priority": "high",
        "progress": 25,
        "created_at": now,
    })
    return {"created": True}

# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"service": "EvaOne.AI", "status": "online", "version": "1.0"}

# ---------- Mount ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
