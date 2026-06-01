# EvaOne.AI - Product Requirements Document

## Problem Statement (Verbatim)

EvaOne.AI is not a chatbot. EvaOne.AI is an AI Chief of Staff, Autonomous Agent Platform, Executive Operating System, Knowledge Engine, Workflow Automation System, and Digital Command Center operating inside the Mentally Creative Studios ecosystem.

The objective is to create a production-grade AI-native platform capable of assisting founders, creators, freelancers, operators, agencies, teams, and businesses through intelligent automation, agent orchestration, executive decision support, file intelligence, workflow management, knowledge retrieval, revenue generation systems, and adaptive multimodal interaction.

## User Personas

- Founders, operators, creators, freelancers
- Agencies and teams needing executive AI support
- Knowledge workers managing files, projects, decisions

## Architecture

- **Backend**: FastAPI + MongoDB (motor async). All routes prefixed with `/api`.
- **Frontend**: React 19 + TailwindCSS + Framer Motion + lucide-react + Sonner toasts. Left-rail OS-style layout.
- **AI Layer**: emergentintegrations LlmChat (Claude Sonnet 4.6, GPT-5.4, Gemini 3 Pro/Flash) via Emergent Universal LLM Key.
- **Voice**: OpenAI Whisper STT + OpenAI TTS (nova voice).
- **Auth**: Emergent-managed Google OAuth (httpOnly session cookies, 7-day expiry).
- **Storage**: Emergent Object Storage (path-prefixed under `evaone/`).
- **Theme**: Deep black + obsidian + electric cyan (#00F0FF) + violet (#8A2BE2) glassmorphism with Outfit/Manrope/JetBrains Mono fonts.

## Core Requirements (Static)

- Production-grade UI feeling like a futuristic OS / executive command center.
- Eva AI avatar with reactive states (idle, listening, thinking, speaking).
- Approval-first execution (never claims external actions).
- User-owned data, secure sessions.

## Phase 1 MVP - IMPLEMENTED (2026-06-01)

### Modules
1. **Eva Chat Core** - Multi-model (Claude / GPT / Gemini), session memory, vault context attach, mic input + TTS playback, model switcher per session
2. **Knowledge Vault** - Notes CRUD, tags, pin, search by title/content, sticky editor sidebar
3. **File Intelligence** - Upload to Object Storage (PDF/DOCX/XLSX/CSV/TXT/images/audio), text extraction (PyPDF2/python-docx/openpyxl), Eva analysis (summary + key points + action items)
4. **Executive Command Center** - Stats grid (sessions/files/notes/projects), strategic priorities, recent activity feed, system health, extracted action items
5. **Eva Avatar Component** - 4-state visual entity with image cross-fade + state-specific glow
6. **Voice** - Push-to-talk recording → Whisper STT → text into composer; assistant replies → TTS → auto-play
7. **Google Auth** - Emergent OAuth callback at `/`, httpOnly session, 7-day cookie

### Backend Endpoints (all under `/api`)
- Auth: `POST /auth/session`, `GET /auth/me`, `POST /auth/logout`, `POST /onboard`
- Models: `GET /models`
- Chat: `GET/POST /chat/sessions`, `DELETE /chat/sessions/{id}`, `GET /chat/sessions/{id}/messages`, `POST /chat/sessions/{id}/messages`
- Voice: `POST /voice/transcribe`, `POST /voice/speak`
- Files: `POST /files/upload`, `GET /files`, `GET/DELETE /files/{id}`, `GET /files/{id}/download`, `POST /files/{id}/analyze`
- Vault: `POST/GET /vault/notes`, `GET/PUT/DELETE /vault/notes/{id}`, `GET /vault/search`
- Projects: `POST/GET /projects`, `PUT/DELETE /projects/{id}`
- Dashboard: `GET /dashboard/stats`, `GET /dashboard/activity`

### Frontend Routes
- `/login` - Google OAuth screen with cinematic background
- `/` - Command Center (auth-gated)
- `/chat` and `/chat/:sessionId` - Eva Chat
- `/vault` - Knowledge Vault
- `/files` - File Intelligence
- `/settings` - Identity, models, voice, keys

## Prioritized Backlog (Phase 2+)

### P0 (Phase 2)
- Agent Forge — agent creation/cloning/training, tool assignment
- Workflow Engine — multi-step, conditional, scheduled, multi-agent
- Approval Queue — draft → approval packet → execution → audit log

### P1 (Phase 3)
- Revenue Intelligence — offer generation, pricing, proposal drafts, opportunity tracking
- CRM lite + client onboarding
- Third-party integrations: Email, Calendar, Stripe, social

### P2 (Phase 4)
- Voice Operating Mode (hands-free, wake word)
- Autonomous Agent Teams
- Local AI Models (Ollama, Qwen, DeepSeek)
- Offline Mode + Local-First sync
- Riftline Racing / WideOpenThrottle ecosystem hooks
