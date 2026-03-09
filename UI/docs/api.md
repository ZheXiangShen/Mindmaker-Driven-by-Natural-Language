# Notes API Reference

Base path: `/api/notes`

All responses are JSON.

## Data Model

### Note

```json
{
  "id": "note_id",
  "title": "string",
  "content": "string",
  "folderId": "string | null",
  "tags": ["tag"],
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "deleted": false,
  "deletedAt": null,
  "snapshots": []
}
```

`snapshots` is returned as an empty array by API mapper.

## Endpoints

### GET `/api/notes`

Fetch all notes (sorted by `updatedAt desc`).

Response `200`:

```json
{ "notes": [/* Note[] */] }
```

Response `500`:

```json
{ "error": "Failed to load notes" }
```

---

### POST `/api/notes`

Create a note.

Request body:

```json
{
  "id": "optional string",
  "title": "optional string",
  "content": "optional string",
  "folderId": "optional string | null",
  "folderName": "optional string",
  "tags": ["optional", "tags"],
  "deleted": false,
  "deletedAt": null
}
```

Behavior:

- `title` defaults to `"无标题笔记"`
- `content` defaults to empty string
- `tags` are normalized to lowercase + deduplicated
- if `folderId` is provided, folder is upserted

Response `201`:

```json
{ "note": {/* Note */} }
```

Response `500`:

```json
{ "error": "Failed to create note" }
```

---

### DELETE `/api/notes?hard=1`

Bulk hard delete all notes.

Response `200`:

```json
{ "success": true }
```

Response `400` (missing `hard=1`):

```json
{ "error": "Only bulk hard delete is supported on this endpoint" }
```

Response `500`:

```json
{ "error": "Failed to clear notes" }
```

---

### GET `/api/notes/:id`

Get one note by id.

Response `200`:

```json
{ "note": {/* Note */} }
```

Response `404`:

```json
{ "error": "Note not found" }
```

Response `500`:

```json
{ "error": "Failed to load note" }
```

---

### PATCH `/api/notes/:id`

Update note fields.

Request body:

```json
{
  "title": "optional string",
  "content": "optional string",
  "folderId": "optional string | null",
  "folderName": "optional string",
  "tags": ["optional", "tags"],
  "deleted": "optional boolean",
  "deletedAt": "optional ISO datetime | null"
}
```

Behavior:

- `title` update also updates note `path`
- `tags` are normalized to lowercase + deduplicated, then reset + reconnect
- `deleted` / `deletedAt` control soft delete state

Response `200`:

```json
{ "note": {/* Note */} }
```

Response `500`:

```json
{ "error": "Failed to update note" }
```

---

### DELETE `/api/notes/:id`

Delete one note.

- default: soft delete (`deletedAt = now`)
- with `?hard=1`: permanent delete

Response `200` soft delete:

```json
{ "note": {/* Note */} }
```

Response `200` hard delete:

```json
{ "success": true }
```

Response `500`:

```json
{ "error": "Failed to delete note" }
```

---

### POST `/api/notes/:id/restore`

Restore a soft-deleted note (`deletedAt = null`).

Response `200`:

```json
{ "note": {/* Note */} }
```

Response `500`:

```json
{ "error": "Failed to restore note" }
```

## Quick cURL Examples

```bash
curl -s http://localhost:3000/api/notes

curl -s -X POST http://localhost:3000/api/notes \
  -H 'Content-Type: application/json' \
  -d '{"title":"API Note","content":"hello"}'

curl -s -X PATCH http://localhost:3000/api/notes/<id> \
  -H 'Content-Type: application/json' \
  -d '{"title":"renamed","tags":["work","refactor"]}'

curl -s -X DELETE "http://localhost:3000/api/notes/<id>?hard=1"
```
