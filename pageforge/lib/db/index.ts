// ═══════════════════════════════════════════════════════════════════
// PageForge AI — File-based JSON database
// Zero-dependency persistence (no SQLite native builds required)
// ═══════════════════════════════════════════════════════════════════
import { promises as fs } from "fs";
import path from "path";
import type { User, Page } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PAGES_FILE = path.join(DATA_DIR, "pages.json");

// Serialize writes per-file to prevent corruption under concurrent access
const writeLocks: Record<string, Promise<void>> = {};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* already exists */
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data) as T[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}

async function writeJson<T>(file: string, data: T[]): Promise<void> {
  await ensureDataDir();
  // Lock per-file to serialize writes
  const prev = writeLocks[file] ?? Promise.resolve();
  const next = prev.then(async () => {
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fs.rename(tmp, file);
  });
  writeLocks[file] = next.catch(() => {});
  await next;
}

// ──────────────────────────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────────────────────────
export const usersDb = {
  async all(): Promise<User[]> {
    return readJson<User>(USERS_FILE);
  },
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.all();
    const normalized = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
  },
  async findById(id: string): Promise<User | null> {
    const users = await this.all();
    return users.find((u) => u.id === id) ?? null;
  },
  async create(user: User): Promise<User> {
    const users = await this.all();
    users.push(user);
    await writeJson(USERS_FILE, users);
    return user;
  },
  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const users = await this.all();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    await writeJson(USERS_FILE, users);
    return users[idx];
  },
  async incrementGenerations(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;
    await this.update(id, { generationsUsed: user.generationsUsed + 1 });
  },
};

// ──────────────────────────────────────────────────────────────────
// Pages
// ──────────────────────────────────────────────────────────────────
export const pagesDb = {
  async all(): Promise<Page[]> {
    return readJson<Page>(PAGES_FILE);
  },
  async findByUserId(userId: string): Promise<Page[]> {
    const pages = await this.all();
    return pages
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async findById(id: string): Promise<Page | null> {
    const pages = await this.all();
    return pages.find((p) => p.id === id) ?? null;
  },
  async findBySlug(slug: string): Promise<Page | null> {
    const pages = await this.all();
    return pages.find((p) => p.slug === slug && p.status === "published") ?? null;
  },
  async create(page: Page): Promise<Page> {
    const pages = await this.all();
    pages.push(page);
    await writeJson(PAGES_FILE, pages);
    return page;
  },
  async update(id: string, patch: Partial<Page>): Promise<Page | null> {
    const pages = await this.all();
    const idx = pages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    pages[idx] = { ...pages[idx], ...patch, updatedAt: new Date().toISOString() };
    await writeJson(PAGES_FILE, pages);
    return pages[idx];
  },
  async delete(id: string): Promise<boolean> {
    const pages = await this.all();
    const filtered = pages.filter((p) => p.id !== id);
    if (filtered.length === pages.length) return false;
    await writeJson(PAGES_FILE, filtered);
    return true;
  },
  async incrementViews(id: string): Promise<void> {
    const page = await this.findById(id);
    if (!page) return;
    await this.update(id, { views: page.views + 1 });
  },
};
