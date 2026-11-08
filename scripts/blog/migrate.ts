import { blogPaths } from "../../lib/blog/config.ts";
import { openBlogDatabase } from "../../lib/blog/database.ts";

const database = openBlogDatabase(blogPaths().database);
const versions = database.prepare("SELECT version FROM blog_migrations ORDER BY version").all();
database.close();
console.log(`Blog database ready. Schema version: ${versions.at(-1)?.version ?? 0}.`);
