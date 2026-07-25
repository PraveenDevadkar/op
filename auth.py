import os
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header
from dotenv import load_dotenv

load_dotenv(override=True)

JWT_SECRET  = os.getenv("JWT_SECRET", "thousandsunny_secret_2024")
JWT_EXPIRY  = 8

# Read password and strip any hidden characters
_RAW_PW     = os.getenv("APP_PASSWORD", "nakama")
APP_PASSWORD = _RAW_PW.strip().lower()

print(f"[Auth] Password loaded: {repr(APP_PASSWORD)}")
print(f"[Auth] Password length: {len(APP_PASSWORD)}")

def verify_password(plain: str) -> bool:
    # Clean the input the same way
    cleaned = plain.strip().lower()

    # Remove punctuation
    for ch in ".,!?;:'\"()[]{}":
        cleaned = cleaned.replace(ch, ' ')

    # Remove filler words
    for filler in ["um","uh","please","i think","say","hey","ok","okay"]:
        cleaned = cleaned.replace(filler, ' ')

    # Collapse spaces
    cleaned = ' '.join(cleaned.split())

    print(f"[Auth] Input:    {repr(cleaned)}")
    print(f"[Auth] Expected: {repr(APP_PASSWORD)}")
    print(f"[Auth] Length match: {len(cleaned)} vs {len(APP_PASSWORD)}")

    # Check 1 — exact
    if cleaned == APP_PASSWORD:
        print("[Auth] Match: EXACT"); return True

    # Check 2 — contained
    if APP_PASSWORD in cleaned:
        print("[Auth] Match: CONTAINED"); return True

    # Check 3 — all words present
    pw_words = set(APP_PASSWORD.split())
    sp_words = set(cleaned.split())
    if pw_words and pw_words.issubset(sp_words):
        print("[Auth] Match: ALL WORDS"); return True

    # Check 4 — no spaces fuzzy
    if APP_PASSWORD.replace(' ','') in cleaned.replace(' ',''):
        print("[Auth] Match: FUZZY"); return True

    print("[Auth] No match")
    return False

def create_token() -> str:
    payload = {
        "sub": "nakama",
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(authorization: str = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="No token provided")
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")
