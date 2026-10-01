# RePurpose Hub — Flask + SQLite

A Bengaluru reuse/donate/exchange listings site. Frontend is plain
HTML/CSS/JS (unchanged from the original design); the backend is now
a small Flask app with a SQLite database instead of Firebase.

## Run it

```
pip install -r requirements.txt
python app.py
```

Open the "This laptop" address printed in the terminal. To use it
from a phone, connect the phone to the same Wi-Fi and open the
"Phones/other devices" address instead.

Data is stored in `data/repurpose.db`; uploaded photos go in
`data/uploads/`. Delete the `data` folder to reset to the demo data.

## Files

- `app.py` — Flask routes (auth, items, requests) and static file serving.
- `schema.sql` — the three SQL tables: `users`, `items`, `requests`.
- `seed.json` — the demo listings, loaded into the database on first run.
- `js/api.js` — replaces `js/firebase-backend.js`; talks to the Flask API.
- `js/app.js`, `css/styles.css`, `index.html` — original frontend, unchanged.

## Deploying (e.g. Railway)

1. Add a `Procfile`: `web: gunicorn app:app` and add `gunicorn` to
   `requirements.txt`.
2. Attach a persistent volume and set `DATA_DIR` to point at it,
   otherwise the database resets on every redeploy.
3. Set a `SECRET_KEY` environment variable.

## HTTPS (for camera / gallery access from phones)

The server now runs over HTTPS with a self-signed certificate it
generates automatically on first run (cached in `data/cert.pem` —
it won't regenerate on every restart, only if your laptop's Wi-Fi
IP changes). Open the `https://...` address it prints.

Because the certificate isn't from a public authority, each device
will show a "your connection is not private" warning the first
time — tap **Advanced → Proceed**. This is expected and safe on
your own network. Once past that, camera and photo-library access
from the "Post item" form work normally, since browsers only allow
those over a secure (HTTPS) connection.

## In-site notifications

The page checks the server every 12 seconds while it's open, so:
- an owner gets a toast when someone requests one of their items
- a requester gets a toast when their request is accepted or declined

No email or push notifications — just an in-app toast, since the
site isn't deployed anywhere with a public HTTPS domain yet.

## Taking a photo vs. choosing one

The "Post item" form now has two explicit buttons: **Take photo**
(opens the phone's camera app directly) and **Choose from gallery**
(opens the photo library). This replaced a single generic file
button because some phones hid the camera option inside that
generic picker. Both still require HTTPS to work, which the server
already provides (see above).

## Received + rating

Once an owner accepts a request, the person who asked now sees a
**Mark received** button on their own side (Dashboard → Outgoing).
Clicking it:
- marks that request "received"
- automatically marks the item "completed" (same as the owner's
  existing "Mark handed over" button \u2014 either one can close it out)
- opens an optional star-rating + feedback prompt

Ratings are tied to the person who owned the item, shown as a
rolling average (`ownerRating` in `/api/state`). Only someone who
actually marked an item received can rate it, and only once per
item.
