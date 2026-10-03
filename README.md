# RePurpose Hub V2

> A community-based platform for exchanging useful items and giving
> unwanted belongings a second life.

RePurpose Hub is a platform designed to connect people who have items
they no longer need with people who may find those items useful.

This repository contains **Version 2** of RePurpose Hub, rebuilt with a
Flask backend and expanded exchange, reputation, and location-sharing
functionality.

---

## About the Project

RePurpose Hub addresses a simple problem: useful items are often thrown
away simply because their current owners no longer need them.

Instead of treating unwanted items as waste, RePurpose Hub provides a
way for users to list, discover, and exchange them with other people.

The platform focuses on making the exchange process more structured and
trustworthy through user profiles, exchange requests, ratings, feedback,
and private location sharing.

---

# Version 1 vs Version 2

RePurpose Hub V2 is an evolution of the original prototype rather than
a completely separate project.

| Area | V1 | V2 |
|---|---|---|
| Architecture | Frontend-only | Flask full-stack application |
| Backend | None | Python + Flask |
| Data storage | Browser `localStorage` | SQLite database |
| Authentication | Client-side prototype | Flask-backed authentication |
| Listings | Local browser data | Persistent database records |
| Exchange requests | Prototype/local state | Backend-managed requests |
| Ratings | Basic rating functionality | Ratings + written feedback |
| User reputation | Limited | Profile-based reputation |
| Written reviews | Stored but not surfaced | Displayed on user profiles |
| Location | Not available | Private exchange-based location sharing |
| Maps | Not available | Google Maps location links |
| Data persistence | Browser-dependent | Server/database-backed |
| API | None | REST-style Flask API |
| HTTPS | Not required | Local HTTPS support |
| Scalability | Prototype-focused | Structured for further development |

### V1

The first version was created as a **frontend prototype**.

It demonstrated the basic concept of RePurpose Hub using HTML, CSS,
JavaScript, and browser `localStorage`. It was useful for demonstrating
the interface and core idea, but application data was stored entirely
within the browser and there was no server-side application layer.

### V2

V2 introduces a proper application architecture with a Flask backend and
SQLite database.

The frontend communicates with the backend through API endpoints,
allowing users, listings, exchange requests, ratings, feedback, and
other application data to be managed centrally.

V2 also expands the original concept with features intended to support
real-world exchanges.

---

# Key Features

## User Accounts

- User registration and login
- Persistent user data
- User profiles
- User reputation through ratings

## Item Listings

- Create and manage listings
- Item descriptions and images
- Browse available items
- Track listing availability

## Exchange Requests

Users can request an item and the owner can accept or decline the
request.

The exchange workflow is:

```text
Browse Item
    ↓
Send Exchange Request
    ↓
Owner Accepts
    ↓
Arrange Exchange
    ↓
Complete Exchange
    ↓
Leave Feedback