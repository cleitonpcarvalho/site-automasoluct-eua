// Bundled with the server so standalone Docker builds do not depend on a cwd SQL file.
// Applied transactionally, in version order; never edit an applied migration.
export const BLOG_MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE blog_posts (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 240),
        subtitle TEXT NOT NULL DEFAULT '',
        slug TEXT NOT NULL UNIQUE CHECK(length(slug) BETWEEN 1 AND 160),
        seo_title TEXT NOT NULL DEFAULT '',
        meta_description TEXT NOT NULL DEFAULT '',
        focus_keyword TEXT NOT NULL DEFAULT '',
        excerpt TEXT NOT NULL DEFAULT '',
        featured_image TEXT CHECK(featured_image IS NULL OR (json_valid(featured_image) AND json_type(featured_image) = 'object')),
        blocks TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(blocks) AND json_type(blocks) = 'array'),
        video TEXT CHECK(video IS NULL OR (json_valid(video) AND json_type(video) = 'object')),
        tags TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(tags) AND json_type(tags) = 'array'),
        status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
        revision INTEGER NOT NULL DEFAULT 1 CHECK(revision >= 1),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        published_at TEXT,
        CHECK((status = 'draft' AND published_at IS NULL) OR (status = 'published' AND published_at IS NOT NULL))
      ) STRICT;

      CREATE INDEX blog_posts_publication ON blog_posts(status, published_at DESC, id);
      CREATE INDEX blog_posts_updated ON blog_posts(updated_at DESC, id);
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE blog_admin_sessions (
        token_hash TEXT PRIMARY KEY NOT NULL,
        credential_version TEXT NOT NULL,
        csrf_token TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      ) STRICT;
      CREATE INDEX blog_admin_sessions_expiry ON blog_admin_sessions(expires_at);
      CREATE TABLE blog_admin_login_limits (
        bucket TEXT PRIMARY KEY NOT NULL,
        attempts INTEGER NOT NULL,
        window_start INTEGER NOT NULL
      ) STRICT;
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE blog_media (
        id TEXT PRIMARY KEY NOT NULL,
        file_name TEXT NOT NULL UNIQUE,
        original_name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        alt TEXT NOT NULL DEFAULT '' CHECK(length(alt) <= 300),
        type TEXT NOT NULL CHECK(type IN ('featured', 'internal', 'other')),
        mime_type TEXT NOT NULL CHECK(mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
        size INTEGER NOT NULL CHECK(size > 0),
        width INTEGER NOT NULL CHECK(width > 0),
        height INTEGER NOT NULL CHECK(height > 0),
        created_at TEXT NOT NULL,
        deleted_at TEXT
      ) STRICT;
      CREATE INDEX blog_media_created ON blog_media(deleted_at, created_at DESC, id);

      -- Keep a minimal deletion record so an editor opened before deletion cannot
      -- save the removed image later. This also protects service/API clients.
      CREATE TRIGGER blog_posts_media_insert BEFORE INSERT ON blog_posts
      WHEN EXISTS (
        SELECT 1 FROM blog_media m WHERE m.deleted_at IS NOT NULL AND (
          json_extract(NEW.featured_image, '$.id') = m.id OR json_extract(NEW.featured_image, '$.url') = m.url OR
          EXISTS (SELECT 1 FROM json_each(NEW.blocks) b WHERE json_extract(b.value, '$.type') = 'image' AND
            (json_extract(b.value, '$.image.id') = m.id OR json_extract(b.value, '$.image.url') = m.url))
        )
      ) BEGIN SELECT RAISE(ABORT, 'blog_media_deleted'); END;
      CREATE TRIGGER blog_posts_media_update BEFORE UPDATE OF featured_image, blocks ON blog_posts
      WHEN EXISTS (
        SELECT 1 FROM blog_media m WHERE m.deleted_at IS NOT NULL AND (
          json_extract(NEW.featured_image, '$.id') = m.id OR json_extract(NEW.featured_image, '$.url') = m.url OR
          EXISTS (SELECT 1 FROM json_each(NEW.blocks) b WHERE json_extract(b.value, '$.type') = 'image' AND
            (json_extract(b.value, '$.image.id') = m.id OR json_extract(b.value, '$.image.url') = m.url))
        )
      ) BEGIN SELECT RAISE(ABORT, 'blog_media_deleted'); END;
    `,
  },
  {
    version: 4,
    sql: `
      ALTER TABLE blog_posts ADD COLUMN editorial TEXT CHECK(editorial IS NULL OR (json_valid(editorial) AND json_type(editorial) = 'object'));
      ALTER TABLE blog_media ADD COLUMN provenance TEXT CHECK(provenance IS NULL OR (json_valid(provenance) AND json_type(provenance) = 'object'));
    `,
  },
] as const;
