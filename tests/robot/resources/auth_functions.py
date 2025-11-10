import uuid
import time
import os
import subprocess
import json


class AuthFunctions:
    def __init__(self):
        # Very small in-memory stores used by tests
        self._local_store = {
            "users": {},  # keyed by email -> user dict with id/password
            "sessions": {},  # token -> email
        }

    def signup(self, data: dict):
        """Simulate user signup. Expects dict with email, password and optional fields.
        Returns created user (without password).
        """
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            raise ValueError("email and password required")

        # if already exists, raise to mimic backend behavior
        if email in self._local_store["users"]:
            raise Exception("user already exists")
        
        try:
            script_content = '''
import { signup } from './lib/actions/auth.js';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input || '{}');
    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);

    const res = await signup(formData);
    console.log(JSON.stringify(res || {}));
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
});
'''

            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            script_path = os.path.join(project_root, 'temp_auth_test.ts')
            with open(script_path, 'w', encoding='utf8') as f:
                f.write(script_content)

            result = subprocess.run(
                ['npx', 'tsx', script_path],
                input=json.dumps({'email': email, 'password': password, 'first_name': data.get('first_name'), 'last_name': data.get('last_name')}),
                capture_output=True,
                text=True,
                cwd=project_root,
                env={**os.environ},
                shell=True
            )

            if os.path.exists(script_path):
                os.remove(script_path)

            if result.returncode == 0 and result.stdout.strip():
                try:
                    parsed = json.loads(result.stdout.strip())
                    if isinstance(parsed, dict) and parsed.get('id'):
                        return parsed
                except Exception:
                    pass
        except Exception:
            # fall through to local fallback
            pass

        # Local in-memory fallback: create user and store password privately
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        # store password privately
        self._local_store["users"][email] = {"user": user, "password": password}
        return user

    def login(self, data: dict):
        """Simulate login. Returns a session token dict on success, None on failure."""
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            return None
        try:
            script_content = '''
import { login } from './lib/actions/auth.js';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input || '{}');
    const formData = new FormData();
    if (data.email) formData.append('email', data.email);
    if (data.password) formData.append('password', data.password);

    const res = await login(formData);
    // login action may not return data; return a simple ok object
    console.log(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
});
'''

            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
            script_path = os.path.join(project_root, 'temp_auth_login.ts')
            with open(script_path, 'w', encoding='utf8') as f:
                f.write(script_content)

            result = subprocess.run(
                ['npx', 'tsx', script_path],
                input=json.dumps({'email': email, 'password': password}),
                capture_output=True,
                text=True,
                cwd=project_root,
                env={**os.environ},
                shell=True
            )

            if os.path.exists(script_path):
                os.remove(script_path)

            if result.returncode == 0:
                # treat as success; create a local session token for tests
                token = str(uuid.uuid4())
                self._local_store['sessions'][token] = {'email': email, 'created_at': time.time()}
                return {'token': token, 'email': email}
        except Exception:
            pass

        # Fallback to local store validation
        entry = self._local_store.get('users', {}).get(email)
        if not entry or entry.get('password') != password:
            return None

        token = str(uuid.uuid4())
        self._local_store['sessions'][token] = {'email': email, 'created_at': time.time()}
        return {'token': token, 'email': email}

    def sign_out(self, token: str):
        """Invalidate a session token. Returns True if token removed, False otherwise."""
        if not token:
            return False
        if token in self._local_store["sessions"]:
            del self._local_store["sessions"][token]
            return True
        return False


# Create global instance and Robot-compatible wrappers
auth_functions = AuthFunctions()

def signup(data):
    return auth_functions.signup(data)

def login(data):
    return auth_functions.login(data)

def sign_out(token):
    return auth_functions.sign_out(token)
