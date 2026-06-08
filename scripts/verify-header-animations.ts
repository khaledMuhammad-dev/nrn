/**
 * Automated checks for header icon hover animations.
 * Run: pnpm run verify:header-icons
 */
import { interpolate } from 'flubber';
import { HEADER_ICON_PATHS } from '../packages/shared/constants/headerIconPaths';
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HARNESS = path.join(__dirname, 'header-icon-harness.html');

type CheckResult = { name: string; pass: boolean; detail: string };

const results: CheckResult[] = [];

function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
}

function testSunRayMorph() {
  const { rays, raysHover } = HEADER_ICON_PATHS.sun;
  try {
    const end = interpolate(rays, raysHover)(1);
    check(
      'sun-ray-morph',
      rays !== raysHover && end.includes('M12 1v3'),
      `end len=${end.length}`
    );
  } catch (e) {
    check('sun-ray-morph', false, String(e));
  }
}

async function sampleMetrics(page: import('playwright').Page, variant: string, waitMs: number) {
  await page.hover(`[data-variant="${variant}"]`);
  await page.waitForTimeout(waitMs);
  return page.evaluate((v) => {
    const root = document.querySelector(`[data-variant="${v}"]`);
    if (!root) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gsap = (window as any).gsap;
    if (v === 'bell') {
      const dome = root.querySelector('.bell-dome');
      const clapper = root.querySelector('.bell-clapper');
      return {
        domeRot: gsap.getProperty(dome, 'rotation') as number,
        clapperRot: gsap.getProperty(clapper, 'rotation') as number,
      };
    }
    if (v === 'sun') {
      const svg = root.querySelector('svg');
      const raysGroup = root.querySelector('.sun-rays-group');
      const rays = root.querySelector('.sun-rays');
      return {
        svgRot: gsap.getProperty(svg, 'rotation') as number,
        raysRot: gsap.getProperty(raysGroup, 'rotation') as number,
        rayD: rays?.getAttribute('d') ?? '',
      };
    }
    if (v === 'logout') {
      const arrow = root.querySelector('.logout-arrow');
      return {
        x: gsap.getProperty(arrow, 'x') as number,
        opacity: gsap.getProperty(arrow, 'opacity') as number,
      };
    }
    return null;
  }, variant);
}

async function testHarnessAnimations() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${HARNESS}`);

  // Bell: clapper swings opposite to dome mid-ring
  const bellMid = await sampleMetrics(page, 'bell', 170);
  if (bellMid) {
    const b = bellMid as { domeRot: number; clapperRot: number };
    check(
      'bell-clapper',
      Math.abs(b.clapperRot) >= 10 && Math.sign(b.clapperRot) !== Math.sign(b.domeRot || 1),
      `dome=${b.domeRot} clapper=${b.clapperRot}`
    );
  } else {
    check('bell-clapper', false, 'no metrics');
  }
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);

  // Sun: center static, rays rotate + extend
  const sunMid = await sampleMetrics(page, 'sun', 750);
  if (sunMid) {
    const s = sunMid as { svgRot: number; raysRot: number; rayD: string };
    const extended = s.rayD.includes('M12 1v3');
    check(
      'sun-rays',
      Math.abs(s.svgRot) < 5 && s.raysRot >= 30 && extended,
      `svgRot=${s.svgRot} raysRot=${s.raysRot} extended=${extended}`
    );
  } else {
    check('sun-rays', false, 'no metrics');
  }
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);

  // Logout: arrow exits right and fades, then returns to rest
  const logoutIn = await sampleMetrics(page, 'logout', 400);
  if (logoutIn) {
    const l = logoutIn as { x: number; opacity: number };
    check('logout-exit', l.x >= 10 && l.opacity < 0.5, `x=${l.x} opacity=${l.opacity}`);
  } else {
    check('logout-exit', false, 'no metrics');
  }
  await page.mouse.move(0, 0);
  await page.waitForTimeout(150);

  const logoutOut = await sampleMetrics(page, 'logout', 900);
  if (logoutOut) {
    const l = logoutOut as { x: number; opacity: number };
    check('logout-return', Math.abs(l.x) < 1 && l.opacity > 0.9, `x=${l.x} opacity=${l.opacity}`);
  } else {
    check('logout-return', false, 'no metrics');
  }

  await browser.close();
}

async function main() {
  testSunRayMorph();
  await testHarnessAnimations();

  const failed = results.filter((r) => !r.pass);
  console.log('\nHeader icon animation verification\n');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.name}: ${r.detail}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed\n`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
