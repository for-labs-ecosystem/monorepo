---
name: r2-tenant-media-pipeline
description: Use this skill when handling image/pdf uploads, galleries, or R2 storage interactions.
---

# R2 Media Pipeline & Storage

## Goal
Maintain a consistent and isolated media pipeline across 50+ tenants.

## Instructions
- **Folder Structure:** Always use tenant-aware paths: `tenant_slug/{category}/{yyyy}/{mm}/{filename}-{hash}.{ext}`.
- Shared media (like global product images) should go into a `global/` or `common/` prefix.
- Store file metadata in the D1 database (tenant_id, path, mime_type, size) for easy media library management.
- Generate and use Signed URLs for admin-only or private uploads.
- Return public Cloudflare CDN URLs for frontend consumption.

## Guardrails
- Never overwrite existing files; append hashes to ensure unique filenames.