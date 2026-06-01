"""Shared fixtures for EvaOne.AI backend tests."""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fall back to reading from frontend/.env
    with open('/app/frontend/.env') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BASE_URL = line.split('=', 1)[1].strip().rstrip('/')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')


def _seed_user(label: str):
    mc = MongoClient(MONGO_URL)
    db = mc[DB_NAME]
    suffix = f"{label}_{uuid.uuid4().hex[:8]}_{int(time.time()*1000)}"
    user_id = f"test-user-{suffix}"
    token = f"test_sess_{suffix}"
    db.users.insert_one({
        "user_id": user_id,
        "email": f"test.{suffix}@example.com",
        "name": f"Test User {label}",
        "picture": "https://via.placeholder.com/150",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    mc.close()
    return user_id, token


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def user_a():
    uid, tok = _seed_user("A")
    return {"user_id": uid, "token": tok}


@pytest.fixture(scope="session")
def user_b():
    uid, tok = _seed_user("B")
    return {"user_id": uid, "token": tok}


@pytest.fixture
def client_a(user_a):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_a['token']}", "Content-Type": "application/json"})
    return s


@pytest.fixture
def client_b(user_b):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {user_b['token']}", "Content-Type": "application/json"})
    return s


@pytest.fixture
def unauth_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s
