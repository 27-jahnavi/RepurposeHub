"""RePurpose Hub - Flask + SQLite backend.

Run:  python app.py
Then open http://localhost:5000  (phones on the same Wi-Fi: use the
"Network" address printed in the terminal).
"""
import base64
import json
import os
import re
import secrets
import socket
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import (Flask, g, jsonify, request, send_from_directory, session)
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "repurpose.db"
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

CATEGORIES = ["Books & Stationery", "Furniture", "Clothes & Accessories",
              "Electronics", "Kitchen Items", "Toys & Others"]
CONDITIONS = ["New-like", "Good", "Needs Repair", "For Creative Repurposing"]
ACTIONS = ["Donate", "Exchange", "Repair", "Repurpose"]
AREAS = ["Jayanagar", "Koramangala", "Indiranagar", "Malleswaram", "HSR Layout",
         "BTM Layout", "Rajajinagar", "Whitefield", "Basavanagudi", "Yelahanka"]

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
ID_RE = re.compile(r"^[a-z]{1,3}_[a-z0-9]{4,12}$")
IMG_RE = re.compile(r"^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=\s]+)$")
MAX_IMAGE_BYTES = 3 * 1024 * 1024


def _secret_key():
    """Keep the same key between restarts so people stay signed in."""
    env = os.environ.get("SECRET_KEY")
    if env:
        return env
    f = DATA_DIR / "secret.key"
    if not f.exists():
        f.write_text(secrets.token_hex(32))
    return f.read_text().strip()


app = Flask(__name__, static_folder=None)
app.config.update(
    SECRET_KEY=_secret_key(),
    MAX_CONTENT_LENGTH=6 * 1024 * 1024,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    PERMANENT_SESSION_LIFETIME=timedelta(days=30),
)


# --------------------------------------------------------------------------
# Database helpers
# --------------------------------------------------------------------------
def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript((BASE_DIR / "schema.sql").read_text())
    if conn.execute("SELECT COUNT(*) FROM items").fetchone()[0] == 0:
        seeds = json.loads((BASE_DIR / "seed.json").read_text())
        for i, s in enumerate(seeds):
            created = datetime.now(timezone.utc) - timedelta(days=s["days"])
            conn.execute(
                """INSERT INTO items (id, name, category, condition, action,
                   location, description, owner_id, owner_name, owner_contact,
                   image, art, status, created_at, demo)
                   VALUES (?,?,?,?,?,?,?,NULL,?,?,NULL,?,'active',?,1)""",
                (f"seed_{i}", s["name"], s["cat"], s["cond"], s["act"],
                 s["loc"], s["desc"], s["owner"], s["phone"], i + 1,
                 created.isoformat()))
    conn.commit()
    conn.close()


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def current_user():
    uid = session.get("uid")
    if not uid:
        return None
    return db().execute("SELECT * FROM users WHERE id = ?", (uid,)).fetchone()


def fail(message, status=400):
    return jsonify({"error": message}), status


def user_json(u):
    return {"id": u["id"], "name": u["name"], "email": u["email"],
            "location": u["location"]}


def item_json(row, me):
    mine = bool(me and row["owner_id"] and row["owner_id"] == me["id"])
    rating = None
    if row["owner_id"]:
        agg = db().execute(
            "SELECT AVG(stars) a, COUNT(*) c FROM ratings WHERE to_user_id = ?",
            (row["owner_id"],)).fetchone()
        if agg["c"]:
            rating = {"avg": round(agg["a"], 1), "count": agg["c"]}
    return {
        "id": row["id"], "name": row["name"], "category": row["category"],
        "ownerId": row["owner_id"],
        "condition": row["condition"], "action": row["action"],
        "location": row["location"], "description": row["description"],
        "ownerName": row["owner_name"],
        # Other people's emails are never sent to the browser.
        "ownerEmail": me["email"] if mine else None,
        "ownerContact": row["owner_contact"], "image": row["image"],
        "art": row["art"], "status": row["status"],
        "createdAt": row["created_at"], "demo": bool(row["demo"]),
        "ownerRating": rating,
    }


def request_json(row):
    locations = db().execute(
        """SELECT user_id, latitude, longitude, accuracy, shared_at
           FROM request_locations WHERE request_id = ?
           ORDER BY shared_at""", (row["id"],)).fetchall()
    return {
        "id": row["id"], "itemId": row["item_id"], "fromName": row["from_name"],
        "fromEmail": row["from_email"], "message": row["message"],
        "createdAt": row["created_at"], "status": row["status"],
        "locations": [{
            "userId": loc["user_id"],
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "accuracy": loc["accuracy"],
            "sharedAt": loc["shared_at"],
        } for loc in locations],
    }


def save_image(data_url):
    """Store a data-URL photo as a file and return its public URL."""
    m = IMG_RE.match(data_url or "")
    if not m:
        raise ValueError("Photo must be a JPEG, PNG or WebP image.")
    try:
        raw = base64.b64decode(m.group(2), validate=False)
    except Exception:
        raise ValueError("Photo could not be read.")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError("Photo is too large (max 3 MB).")
    ext = {"jpeg": "jpg", "png": "png", "webp": "webp"}[m.group(1)]
    name = f"{uuid.uuid4().hex}.{ext}"
    (UPLOAD_DIR / name).write_bytes(raw)
    return f"/uploads/{name}"


def delete_image(url):
    if url and url.startswith("/uploads/"):
        p = UPLOAD_DIR / Path(url).name
        if p.is_file():
            p.unlink()


def clean_id(value, prefix):
    if isinstance(value, str) and ID_RE.match(value):
        return value
    return f"{prefix}_{secrets.token_hex(4)}"


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
@app.post("/api/register")
def register():
    d = request.get_json(silent=True) or {}
    name = str(d.get("name", "")).strip()
    email = str(d.get("email", "")).strip()
    password = str(d.get("password", ""))
    location = str(d.get("location", ""))
    if len(name) < 2 or len(name) > 60:
        return fail("Enter your name.")
    if not EMAIL_RE.match(email):
        return fail("Enter a valid email address.")
    if len(password) < 6:
        return fail("Password must be at least 6 characters.")
    if location not in AREAS:
        location = AREAS[0]
    uid = "u_" + secrets.token_hex(4)
    try:
        db().execute(
            "INSERT INTO users (id, name, email, password_hash, location, created_at)"
            " VALUES (?,?,?,?,?,?)",
            (uid, name, email, generate_password_hash(password), location, now_iso()))
        db().commit()
    except sqlite3.IntegrityError:
        return fail("That email is already registered. Sign in instead.", 409)
    session.clear()
    session.permanent = True
    session["uid"] = uid
    return jsonify({"session": user_json(current_user())})


@app.post("/api/login")
def login():
    d = request.get_json(silent=True) or {}
    email = str(d.get("email", "")).strip()
    password = str(d.get("password", ""))
    u = db().execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if not u:
        return fail("No account with that email. Create one first.", 401)
    if not check_password_hash(u["password_hash"], password):
        return fail("That password doesn't match.", 401)
    session.clear()
    session.permanent = True
    session["uid"] = u["id"]
    return jsonify({"session": user_json(u)})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# State (everything the UI needs in one call)
# --------------------------------------------------------------------------
@app.get("/api/state")
def state():
    me = current_user()
    items = db().execute("SELECT * FROM items ORDER BY created_at DESC").fetchall()
    if me:
        reqs = db().execute(
            """SELECT r.* FROM requests r JOIN items i ON i.id = r.item_id
               WHERE r.from_user_id = ? OR i.owner_id = ?
               ORDER BY r.created_at""", (me["id"], me["id"])).fetchall()
    else:
        reqs = []
    users = db().execute("SELECT id FROM users").fetchall()
    resp = jsonify({
        "items": [item_json(r, me) for r in items],
        "requests": [request_json(r) for r in reqs],
        "users": [{"id": u["id"]} for u in users],
        "session": user_json(me) if me else None,
    })
    resp.headers["Cache-Control"] = "no-store"
    return resp


# --------------------------------------------------------------------------
# Items
# --------------------------------------------------------------------------
@app.post("/api/items")
def create_item():
    me = current_user()
    if not me:
        return fail("Sign in to post an item.", 401)
    d = request.get_json(silent=True) or {}
    name = str(d.get("name", "")).strip()
    desc = str(d.get("description", "")).strip()
    category, condition = d.get("category"), d.get("condition")
    action, location = d.get("action"), d.get("location")
    if not (3 <= len(name) <= 80):
        return fail("Item name must be 3-80 characters.")
    if not (15 <= len(desc) <= 1000):
        return fail("Description must be 15-1000 characters.")
    if category not in CATEGORIES or condition not in CONDITIONS \
            or action not in ACTIONS or location not in AREAS:
        return fail("Invalid category, condition, reuse option or area.")
    contact = str(d.get("ownerContact") or "").strip()[:30] or None
    art = d.get("art")
    art = art if isinstance(art, int) and 1 <= art <= 9 else 1
    image = None
    if d.get("image"):
        try:
            image = save_image(d["image"])
        except ValueError as e:
            return fail(str(e))
    item_id = clean_id(d.get("id"), "it")
    if db().execute("SELECT 1 FROM items WHERE id = ?", (item_id,)).fetchone():
        item_id = f"it_{secrets.token_hex(4)}"
    db().execute(
        """INSERT INTO items (id, name, category, condition, action, location,
           description, owner_id, owner_name, owner_contact, image, art, status,
           created_at, demo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'active',?,0)""",
        (item_id, name, category, condition, action, location, desc,
         me["id"], me["name"], contact, image, art, now_iso()))
    db().commit()
    row = db().execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    return jsonify({"item": item_json(row, me)}), 201


@app.put("/api/items/<item_id>")
def update_item(item_id):
    me = current_user()
    if not me:
        return fail("Sign in first.", 401)
    row = db().execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        return fail("Listing not found.", 404)
    if row["owner_id"] != me["id"]:
        return fail("Only the owner can change this listing.", 403)
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in ("active", "completed"):
        return fail("Invalid status.")
    db().execute("UPDATE items SET status = ? WHERE id = ?", (status, item_id))
    db().commit()
    return jsonify({"ok": True})


@app.delete("/api/items/<item_id>")
def delete_item(item_id):
    me = current_user()
    if not me:
        return fail("Sign in first.", 401)
    row = db().execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
    if not row:
        return jsonify({"ok": True})
    if row["owner_id"] != me["id"]:
        return fail("Only the owner can remove this listing.", 403)
    db().execute("DELETE FROM items WHERE id = ?", (item_id,))
    db().commit()
    delete_image(row["image"])
    return jsonify({"ok": True})


# --------------------------------------------------------------------------
# Requests ("I'm interested")
# --------------------------------------------------------------------------
@app.post("/api/requests")
def create_request():
    me = current_user()
    if not me:
        return fail("Sign in to send a request.", 401)
    d = request.get_json(silent=True) or {}
    item = db().execute("SELECT * FROM items WHERE id = ?",
                        (d.get("itemId"),)).fetchone()
    if not item:
        return fail("Listing not found.", 404)
    if item["owner_id"] == me["id"]:
        return fail("You can't request your own listing.")
    if item["status"] != "active":
        return fail("This item has already been handed over.")
    message = str(d.get("message", "")).strip()
    if not (8 <= len(message) <= 600):
        return fail("Write a short message (8-600 characters).")
    req_id = clean_id(d.get("id"), "r")
    try:
        db().execute(
            """INSERT INTO requests (id, item_id, from_user_id, from_name,
               from_email, message, status, created_at)
               VALUES (?,?,?,?,?,?,'pending',?)""",
            (req_id, item["id"], me["id"], me["name"], me["email"],
             message, now_iso()))
        db().commit()
    except sqlite3.IntegrityError:
        return fail("You have already sent a request for this item.", 409)
    return jsonify({"ok": True}), 201


@app.put("/api/requests/<req_id>")
def update_request(req_id):
    me = current_user()
    if not me:
        return fail("Sign in first.", 401)
    row = db().execute(
        """SELECT r.*, i.owner_id, i.id AS item_id2 FROM requests r
           JOIN items i ON i.id = r.item_id WHERE r.id = ?""", (req_id,)).fetchone()
    if not row:
        return fail("Request not found.", 404)
    status = (request.get_json(silent=True) or {}).get("status")

    is_owner = row["owner_id"] == me["id"]
    is_requester = row["from_user_id"] == me["id"]

    if status in ("accepted", "declined"):
        if not is_owner:
            return fail("Only the listing owner can answer a request.", 403)
        if row["status"] != "pending":
            return fail("This request was already answered.", 409)
    elif status == "received":
        if not is_requester:
            return fail("Only the person who asked for this item can mark it received.", 403)
        if row["status"] != "accepted":
            return fail("This request has not been accepted yet.", 409)
    else:
        return fail("Invalid status.")

    db().execute("UPDATE requests SET status = ? WHERE id = ?", (status, req_id))
    if status == "received":
        db().execute("UPDATE items SET status = 'completed' WHERE id = ?", (row["item_id"],))
    db().commit()
    return jsonify({"ok": True})


@app.post("/api/requests/<req_id>/location")
def share_request_location(req_id):
    """Share the user's current location privately with the other exchange participant."""
    me = current_user()
    if not me:
        return fail("Sign in first.", 401)

    d = request.get_json(silent=True) or {}
    try:
        latitude = float(d.get("latitude"))
        longitude = float(d.get("longitude"))
        accuracy = float(d.get("accuracy")) if d.get("accuracy") is not None else None
    except (TypeError, ValueError):
        return fail("Invalid location data.")

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        return fail("Invalid location coordinates.")
    if accuracy is not None and (accuracy < 0 or accuracy > 100000):
        return fail("Invalid location accuracy.")

    row = db().execute(
        """SELECT r.*, i.owner_id
           FROM requests r JOIN items i ON i.id = r.item_id
           WHERE r.id = ?""", (req_id,)).fetchone()
    if not row:
        return fail("Request not found.", 404)
    if me["id"] not in (row["from_user_id"], row["owner_id"]):
        return fail("You are not part of this exchange.", 403)
    if row["status"] not in ("accepted", "received"):
        return fail("Location sharing is available after the request is accepted.", 409)

    db().execute(
        """INSERT INTO request_locations
           (id, request_id, user_id, latitude, longitude, accuracy, shared_at)
           VALUES (?,?,?,?,?,?,?)
           ON CONFLICT(request_id, user_id) DO UPDATE SET
             latitude=excluded.latitude, longitude=excluded.longitude,
             accuracy=excluded.accuracy, shared_at=excluded.shared_at""",
        ("loc_" + secrets.token_hex(4), req_id, me["id"], latitude, longitude, accuracy, now_iso()))
    db().commit()
    return jsonify({"ok": True})


@app.get("/api/users/<user_id>/profile")
def user_profile(user_id):
    user = db().execute(
        "SELECT id, name, location, created_at FROM users WHERE id = ?",
        (user_id,)).fetchone()
    if not user:
        return fail("User not found.", 404)

    agg = db().execute(
        "SELECT AVG(stars) a, COUNT(*) c FROM ratings WHERE to_user_id = ?",
        (user_id,)).fetchone()
    reviews = db().execute(
        """SELECT r.stars, r.feedback, r.created_at,
                  u.name AS from_name, i.name AS item_name
           FROM ratings r
           LEFT JOIN users u ON u.id = r.from_user_id
           LEFT JOIN items i ON i.id = r.item_id
           WHERE r.to_user_id = ?
           ORDER BY r.created_at DESC""",
        (user_id,)).fetchall()

    return jsonify({
        "user": {
            "id": user["id"],
            "name": user["name"],
            "location": user["location"],
            "createdAt": user["created_at"],
        },
        "rating": {
            "avg": round(agg["a"], 1),
            "count": agg["c"],
        } if agg["c"] else None,
        "reviews": [{
            "stars": r["stars"],
            "feedback": r["feedback"],
            "createdAt": r["created_at"],
            "fromName": r["from_name"] or "A RePurpose Hub user",
            "itemName": r["item_name"] or "Exchange item",
        } for r in reviews if r["feedback"]]
    })


@app.post("/api/ratings")
def create_rating():
    me = current_user()
    if not me:
        return fail("Sign in first.", 401)
    d = request.get_json(silent=True) or {}
    stars = d.get("stars")
    if not isinstance(stars, int) or not (1 <= stars <= 5):
        return fail("Rating must be 1-5 stars.")
    feedback = str(d.get("feedback") or "").strip()[:500] or None
    item = db().execute("SELECT * FROM items WHERE id = ?", (d.get("itemId"),)).fetchone()
    if not item:
        return fail("Listing not found.", 404)
    got_it = db().execute(
        """SELECT 1 FROM requests WHERE item_id = ? AND from_user_id = ?
           AND status = 'received'""", (item["id"], me["id"])).fetchone()
    if not got_it:
        return fail("You can only rate an item after marking it received.", 403)
    rating_id = "rt_" + secrets.token_hex(4)
    try:
        db().execute(
            """INSERT INTO ratings (id, item_id, from_user_id, to_user_id, stars,
               feedback, created_at) VALUES (?,?,?,?,?,?,?)""",
            (rating_id, item["id"], me["id"], item["owner_id"], stars, feedback, now_iso()))
        db().commit()
    except sqlite3.IntegrityError:
        return fail("You already rated this item.", 409)
    return jsonify({"ok": True}), 201


# --------------------------------------------------------------------------
# Static files
# --------------------------------------------------------------------------
@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/css/<path:name>")
def css(name):
    return send_from_directory(BASE_DIR / "css", name)


@app.get("/js/<path:name>")
def js(name):
    return send_from_directory(BASE_DIR / "js", name)


@app.get("/uploads/<path:name>")
def uploads(name):
    return send_from_directory(UPLOAD_DIR, name)


@app.errorhandler(413)
def too_big(_e):
    return fail("That upload is too large.", 413)


init_db()


def _lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except OSError:
        return "your-laptop-ip"


def _ssl_context(lan_ip):
    """A self-signed cert, cached in data/, that covers localhost, 127.0.0.1
    and this machine's current LAN IP. Browsers need HTTPS (not plain HTTP)
    before they'll allow camera or photo-library access from a web page, so
    this is what makes that work on phones over Wi-Fi. The browser will still
    show a one-time "not private" warning per device, since the cert is not
    from a trusted authority -- click Advanced -> Proceed to continue."""
    from cryptography import x509
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.x509.oid import NameOID
    import ipaddress
    import datetime as dt

    cert_path, key_path, meta_path = (DATA_DIR / n for n in
                                       ("cert.pem", "key.pem", "cert.meta"))
    if cert_path.exists() and key_path.exists() and meta_path.exists() \
            and meta_path.read_text().strip() == lan_ip:
        return str(cert_path), str(key_path)

    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, "RePurpose Hub (local)")])
    alt_names = [x509.DNSName("localhost"), x509.IPAddress(ipaddress.IPv4Address("127.0.0.1"))]
    try:
        alt_names.append(x509.IPAddress(ipaddress.IPv4Address(lan_ip)))
    except ValueError:
        pass
    cert = (x509.CertificateBuilder()
            .subject_name(subject).issuer_name(issuer)
            .public_key(key.public_key())
            .serial_number(x509.random_serial_number())
            .not_valid_before(dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=1))
            .not_valid_after(dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=825))
            .add_extension(x509.SubjectAlternativeName(alt_names), critical=False)
            .sign(key, hashes.SHA256()))

    key_path.write_bytes(key.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption()))
    cert_path.write_bytes(cert.public_bytes(serialization.Encoding.PEM))
    meta_path.write_text(lan_ip)
    return str(cert_path), str(key_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    lan_ip = _lan_ip()
    try:
        ssl_context = _ssl_context(lan_ip)
    except ImportError:
        print("\n  Missing dependency: run  pip install -r requirements.txt\n"
              "  (needs the 'cryptography' package to create the HTTPS certificate)\n")
        raise SystemExit(1)

    print(f"\n  RePurpose Hub is running over HTTPS")
    print(f"  This laptop : https://localhost:{port}")
    print(f"  Phones/other devices on the same Wi-Fi : https://{lan_ip}:{port}")
    print(f"  The certificate is self-signed, so the browser will warn")
    print(f"  \"your connection is not private\" the first time on each device")
    print(f"  -- tap Advanced, then Proceed. This is expected and safe on your")
    print(f"  own Wi-Fi.\n")
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True, ssl_context=ssl_context)
