import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const IMAGES_DIR = path.resolve(__dirname, '../../lab-guide/images');
const MAP_PATH = path.join(IMAGES_DIR, 'map.json');

interface StepEntry {
  step: string;
  filename: string;
  url: string;
  description: string;
  timestamp: string;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readMap(): StepEntry[] {
  if (!fs.existsSync(MAP_PATH)) return [];
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
}

function writeMap(entries: StepEntry[]) {
  fs.writeFileSync(MAP_PATH, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Capture a screenshot for a lab step and update map.json.
 */
export async function captureStep(
  page: Page,
  stepNumber: number,
  slug: string,
  options?: { description?: string; fullPage?: boolean }
) {
  ensureDir(IMAGES_DIR);

  const paddedStep = String(stepNumber).padStart(3, '0');
  const filename = `step-${paddedStep}-${slug}.png`;
  const filepath = path.join(IMAGES_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: options?.fullPage ?? false,
  });

  const map = readMap();
  // Replace existing entry for same step or append
  const existing = map.findIndex((e) => e.step === paddedStep);
  const entry: StepEntry = {
    step: paddedStep,
    filename,
    url: page.url(),
    description: options?.description || slug.replace(/-/g, ' '),
    timestamp: new Date().toISOString(),
  };
  if (existing >= 0) {
    map[existing] = entry;
  } else {
    map.push(entry);
  }
  writeMap(map);

  return filepath;
}
