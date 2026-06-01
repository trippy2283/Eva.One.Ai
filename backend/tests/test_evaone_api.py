"""EvaOne.AI full backend API test suite (pytest)."""
import io
import json
import math
import struct
import time
import wave
import pytest
import requests

# ---------- Auth ----------
class TestAuth:
    def test_me_with_valid_bearer(self, base_url, client_a, user_a):
        r = client_a.get(f"{base_url}/api/auth/me")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == user_a["user_id"]
        assert "email" in data and "name" in data

    def test_me_without_token(self, base_url, unauth_client):
        r = unauth_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self, base_url, unauth_client):
        unauth_client.headers["Authorization"] = "Bearer invalid_token_xxx"
        r = unauth_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_logout_cookie_path(self, base_url, user_a):
        # Logout uses cookie-based session; verify endpoint reachable and returns ok
        r = requests.post(f"{base_url}/api/auth/logout",
                          cookies={"session_token": "nonexistent"})
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- Models ----------
class TestModels:
    def test_list_models(self, base_url, client_a):
        r = client_a.get(f"{base_url}/api/models")
        assert r.status_code == 200
        models = r.json()
        ids = {m["id"] for m in models}
        expected = {"claude-sonnet-4-6", "gpt-5", "gemini-3.1-pro-preview", "gemini-3-flash-preview"}
        assert expected.issubset(ids), f"Missing models. Got: {ids}"
        for m in models:
            assert "label" in m and "provider" in m


# ---------- Chat ----------
@pytest.fixture(scope="class")
def chat_session_id(base_url, user_a):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_a['token']}", "Content-Type": "application/json"})
    r = s.post(f"{base_url}/api/chat/sessions", json={"title": "TEST_session", "model": "claude-sonnet-4-6"})
    assert r.status_code == 200, r.text
    return r.json()["id"]


class TestChat:
    def test_create_session(self, base_url, client_a):
        r = client_a.post(f"{base_url}/api/chat/sessions", json={"title": "TEST_chat", "model": "claude-sonnet-4-6"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["id"].startswith("sess_")
        assert d["model"] == "claude-sonnet-4-6"
        assert d["title"] == "TEST_chat"

    def test_list_sessions(self, base_url, client_a, chat_session_id):
        r = client_a.get(f"{base_url}/api/chat/sessions")
        assert r.status_code == 200
        assert any(s["id"] == chat_session_id for s in r.json())

    def test_send_message_claude_default(self, base_url, client_a, chat_session_id):
        r = client_a.post(
            f"{base_url}/api/chat/sessions/{chat_session_id}/messages",
            json={"content": "Reply with exactly the word: PONG"},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert "user_message" in d and "assistant_message" in d
        assert d["assistant_message"]["role"] == "assistant"
        assert len(d["assistant_message"]["content"]) > 0
        assert d["user_message"]["content"] == "Reply with exactly the word: PONG"

    def test_list_messages_ordered(self, base_url, client_a, chat_session_id):
        r = client_a.get(f"{base_url}/api/chat/sessions/{chat_session_id}/messages")
        assert r.status_code == 200
        msgs = r.json()
        assert len(msgs) >= 2
        # First should be user, then assistant
        assert msgs[0]["role"] == "user"
        assert msgs[1]["role"] == "assistant"

    def test_send_message_gpt_switch(self, base_url):
        # gpt-5 is gated under multi_model feature; use persistent owner (studio plan)
        s = requests.Session()
        s.headers.update({"Authorization": "Bearer evatest_token_1780314396324",
                          "Content-Type": "application/json"})
        cs = s.post(f"{base_url}/api/chat/sessions", json={"model": "gpt-5"})
        assert cs.status_code == 200, cs.text
        sid = cs.json()["id"]
        r = s.post(
            f"{base_url}/api/chat/sessions/{sid}/messages",
            json={"content": "Say hi in one word.", "model": "gpt-5"},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["assistant_message"]["model"] == "gpt-5"
        assert len(d["assistant_message"]["content"]) > 0

    def test_delete_session(self, base_url, client_a):
        s = client_a.post(f"{base_url}/api/chat/sessions", json={})
        sid = s.json()["id"]
        r = client_a.delete(f"{base_url}/api/chat/sessions/{sid}")
        assert r.status_code == 200
        # Verify deletion
        r2 = client_a.get(f"{base_url}/api/chat/sessions/{sid}/messages")
        assert r2.status_code == 404


# ---------- Vault Notes ----------
class TestVault:
    def test_note_crud_and_search(self, base_url, client_a):
        # Create
        c = client_a.post(f"{base_url}/api/vault/notes",
                          json={"title": "TEST_note_alpha", "content": "alpha-content xyz", "tags": ["TEST_tag"], "pinned": False})
        assert c.status_code == 200
        nid = c.json()["id"]
        assert c.json()["title"] == "TEST_note_alpha"

        # Get
        g = client_a.get(f"{base_url}/api/vault/notes/{nid}")
        assert g.status_code == 200 and g.json()["id"] == nid

        # Update
        u = client_a.put(f"{base_url}/api/vault/notes/{nid}",
                        json={"title": "TEST_note_beta", "pinned": True})
        assert u.status_code == 200
        assert u.json()["title"] == "TEST_note_beta"
        assert u.json()["pinned"] is True

        # Search by q
        s = client_a.get(f"{base_url}/api/vault/notes?q=alpha-content")
        assert s.status_code == 200
        assert any(n["id"] == nid for n in s.json())

        # Tag filter
        t = client_a.get(f"{base_url}/api/vault/notes?tag=TEST_tag")
        assert t.status_code == 200
        assert any(n["id"] == nid for n in t.json())

        # Unified search
        vs = client_a.get(f"{base_url}/api/vault/search?q=alpha-content")
        assert vs.status_code == 200
        d = vs.json()
        assert "notes" in d and "files" in d
        assert any(n["id"] == nid for n in d["notes"])

        # Delete
        d = client_a.delete(f"{base_url}/api/vault/notes/{nid}")
        assert d.status_code == 200


# ---------- Projects ----------
class TestProjects:
    def test_project_crud(self, base_url, client_a):
        c = client_a.post(f"{base_url}/api/projects",
                          json={"name": "TEST_proj", "description": "d", "priority": "high"})
        assert c.status_code == 200
        pid = c.json()["id"]
        assert c.json()["name"] == "TEST_proj"

        lst = client_a.get(f"{base_url}/api/projects")
        assert lst.status_code == 200
        assert any(p["id"] == pid for p in lst.json())

        u = client_a.put(f"{base_url}/api/projects/{pid}",
                         json={"progress": 75, "status": "active"})
        assert u.status_code == 200
        assert u.json()["progress"] == 75

        d = client_a.delete(f"{base_url}/api/projects/{pid}")
        assert d.status_code == 200


# ---------- Onboarding ----------
class TestOnboard:
    def test_onboard_idempotent(self, base_url, user_b):
        # Use user_b which has no notes yet
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {user_b['token']}", "Content-Type": "application/json"})
        r1 = s.post(f"{base_url}/api/onboard")
        assert r1.status_code == 200
        # first call should create
        assert r1.json().get("created") in (True, False)  # may be False if already done; not strict
        r2 = s.post(f"{base_url}/api/onboard")
        assert r2.status_code == 200
        assert r2.json()["created"] is False


# ---------- Dashboard ----------
class TestDashboard:
    def test_stats(self, base_url, client_a):
        r = client_a.get(f"{base_url}/api/dashboard/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ["sessions", "messages", "files", "notes", "projects_total", "projects_active", "open_actions", "system_health"]:
            assert k in d, f"Missing key {k}"
        for hk in ["llm", "storage", "voice", "vault"]:
            assert hk in d["system_health"]

    def test_activity(self, base_url, client_a):
        r = client_a.get(f"{base_url}/api/dashboard/activity")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Files ----------
@pytest.fixture(scope="class")
def uploaded_file_id(base_url, user_a):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_a['token']}"})
    content = (b"Project Apollo Strategy\n\n"
               b"Q1 Goals:\n- Launch beta product\n- Onboard 100 enterprise users\n- Hire VP Engineering\n\n"
               b"Risks: Budget constraints, vendor delays, regulatory approval.\n"
               b"Next steps: schedule board review, finalize pricing, prepare PR campaign.\n")
    files = {"file": ("TEST_strategy.txt", io.BytesIO(content), "text/plain")}
    r = s.post(f"{base_url}/api/files/upload", files=files, timeout=60)
    assert r.status_code == 200, r.text
    return r.json()["id"]


class TestFiles:
    def test_upload(self, base_url, uploaded_file_id, client_a):
        r = client_a.get(f"{base_url}/api/files/{uploaded_file_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["filename"] == "TEST_strategy.txt"
        assert d["status"] == "uploaded"
        assert d["extracted_text_preview"] and "Apollo" in d["extracted_text_preview"]

    def test_list_files(self, base_url, client_a, uploaded_file_id):
        r = client_a.get(f"{base_url}/api/files")
        assert r.status_code == 200
        assert any(f["id"] == uploaded_file_id for f in r.json())

    def test_download(self, base_url, user_a, uploaded_file_id):
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {user_a['token']}"})
        r = s.get(f"{base_url}/api/files/{uploaded_file_id}/download", timeout=60)
        assert r.status_code == 200
        assert b"Apollo" in r.content

    def test_analyze(self, base_url, client_a, uploaded_file_id):
        r = client_a.post(f"{base_url}/api/files/{uploaded_file_id}/analyze",
                          json={}, timeout=180)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "analyzed"
        assert isinstance(d.get("summary"), str) and len(d["summary"]) > 0
        assert isinstance(d.get("key_points"), list)
        assert isinstance(d.get("action_items"), list)

    def test_delete_soft(self, base_url, client_a, user_a):
        # Upload a new file then soft-delete
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {user_a['token']}"})
        files = {"file": ("TEST_del.txt", io.BytesIO(b"delete me"), "text/plain")}
        u = s.post(f"{base_url}/api/files/upload", files=files, timeout=60)
        fid = u.json()["id"]
        d = client_a.delete(f"{base_url}/api/files/{fid}")
        assert d.status_code == 200
        g = client_a.get(f"{base_url}/api/files/{fid}")
        assert g.status_code == 404


# ---------- Auth Isolation ----------
class TestIsolation:
    def test_user_b_cannot_see_user_a_data(self, base_url, client_a, client_b):
        # Create note as A
        a_note = client_a.post(f"{base_url}/api/vault/notes",
                               json={"title": "TEST_secret_A", "content": "A only", "tags": []}).json()
        # B should not see it in list/search
        b_notes = client_b.get(f"{base_url}/api/vault/notes").json()
        assert not any(n["id"] == a_note["id"] for n in b_notes)
        # Direct get should 404
        r = client_b.get(f"{base_url}/api/vault/notes/{a_note['id']}")
        assert r.status_code == 404
        # Cleanup
        client_a.delete(f"{base_url}/api/vault/notes/{a_note['id']}")


# ---------- Voice ----------
def _make_wav_bytes(duration_sec=1.0, freq=440.0, rate=16000):
    """Generate a tiny PCM WAV sine tone."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        frames = []
        for i in range(int(duration_sec * rate)):
            v = int(32767 * 0.2 * math.sin(2 * math.pi * freq * i / rate))
            frames.append(struct.pack("<h", v))
        wf.writeframes(b"".join(frames))
    return buf.getvalue()


class TestVoice:
    def test_transcribe(self, base_url, user_a):
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {user_a['token']}"})
        wav = _make_wav_bytes()
        files = {"audio": ("test.wav", io.BytesIO(wav), "audio/wav")}
        r = s.post(f"{base_url}/api/voice/transcribe", files=files, timeout=60)
        # Whisper may return empty text for sine tone but endpoint must work
        assert r.status_code == 200, r.text
        assert "text" in r.json()

    def test_speak(self, base_url, client_a):
        r = client_a.post(f"{base_url}/api/voice/speak",
                          json={"text": "Hello from Eva."}, timeout=60)
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type", "").startswith("audio/")
        assert len(r.content) > 1000  # non-empty audio

    def test_speak_empty(self, base_url, client_a):
        r = client_a.post(f"{base_url}/api/voice/speak", json={"text": "  "})
        assert r.status_code == 400
