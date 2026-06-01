# EvaOne.AI - Auth Gated App Testing Playbook

## Step 1: Create Test User & Session

```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend APIs

```bash
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Auth me
curl -X GET "$API_URL/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# List chat sessions
curl -X GET "$API_URL/api/chat/sessions" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Create chat session
curl -X POST "$API_URL/api/chat/sessions" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "claude-sonnet-4-6"}'

# Send message
curl -X POST "$API_URL/api/chat/sessions/SID/messages" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello Eva", "model": "claude-sonnet-4-6"}'

# Vault notes
curl -X GET "$API_URL/api/vault/notes" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Files
curl -X GET "$API_URL/api/files" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Dashboard
curl -X GET "$API_URL/api/dashboard/stats" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$API_URL/api/dashboard/activity" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing (Playwright)

```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "YOUR_SESSION_TOKEN",
    "domain": "executive-os-preview.preview.emergentagent.com",
    "path": "/",
    "httpOnly": True,
    "secure": True,
    "sameSite": "None"
}])
await page.goto("https://executive-os-preview.preview.emergentagent.com/")
```

## Auth Endpoints

- `POST /api/auth/session` — exchange Emergent session_id for backend session_token (sets httpOnly cookie)
- `GET /api/auth/me` — verify session, returns current user
- `POST /api/auth/logout` — clear session

## Notes

- Frontend processes OAuth callback at root path `/` (look for `#session_id=` in URL hash)
- Authentication uses BOTH httpOnly cookies AND `Authorization: Bearer` header (fallback)
- All user docs use `user_id` field (custom UUID), MongoDB `_id` is excluded with `{"_id": 0}` projection
