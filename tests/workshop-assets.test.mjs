import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const root = new URL('../public/workshop/', import.meta.url);

async function createPrototype(hash = '#landing') {
  const source = await readFile(new URL('mock/index.html', root), 'utf8');
  const script = source.match(/<script>([\s\S]*)<\/script>/)[1];
  const app = {innerHTML: ''};
  const focusTarget = {focusCount: 0, setAttribute() {}, focus() { this.focusCount += 1; }};
  let hashchange;
  const context = {
    location: {hash},
    document: {
      body: {className: ''},
      getElementById: () => app,
      querySelector: () => focusTarget,
    },
    window: {scrollTo() {}},
    addEventListener(type, listener) { if (type === 'hashchange') hashchange = listener; },
  };
  runInNewContext(script, context);
  return {app, focusTarget, navigate(nextHash) { context.location.hash = nextHash; hashchange(); }};
}

function contrastRatio(hexA, hexB) {
  const luminance = hex => {
    const channels = hex.match(/[\da-f]{2}/gi).map(value => parseInt(value, 16) / 255);
    const linear = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  const [lighter, darker] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (lighter + .05) / (darker + .05);
}

test('prepared copy points to bundled assets and preserves disclosures', async () => {
  const data = JSON.parse(await readFile(new URL('content.json', root), 'utf8'));
  assert.equal(data.team[0].character, 'Female fox');
  assert.equal(data.customers.length, 4);
  assert.match(data.testimonialDisclosure, /Fictional/);
  assert.match(data.disclosure, /not validated human research/);
  const paths = [data.brand.logo, ...data.team.map(x=>x.image), ...data.customers.flatMap(x=>[x.logo,x.image]), ...data.supporters.map(x=>x.logo), ...data.extraCharacters.map(x=>`characters/${x}.png`)];
  await Promise.all(paths.map(p=>access(new URL(p, root))));
  for(const page of ['landing','workspace','results']) await access(new URL(`mock/${page}.png`,root));
});

test('guide uses prepared assets instead of asking for new portrait generation', async () => {
  const guide = await readFile(new URL('../WORKSHOP-GUIDE.md', import.meta.url),'utf8');
  assert.match(guide, /public\/workshop\/content.json/);
  assert.doesNotMatch(guide, /DiceBear/);
  assert.match(guide, /Workspace and Results tasks yourself/);
  const project = guide.indexOf('## A — Set up and see the paper mock');
  const clone = guide.indexOf('### Clone your new repo on the workshop VM');
  const codexProject = guide.indexOf('### Add your Codex project');
  const preview = guide.indexOf('### See the paper mock');
  const deployment = guide.indexOf('## B — Publish with GitHub Pages');
  const modernization = guide.indexOf('## C — Modernize the landing page');
  assert.ok(project >= 0 && project < clone && clone < codexProject && codexProject < preview && preview < deployment && deployment < modernization);
  assert.match(guide, /Check that the clone's origin points to my new GitHub repository/);
  assert.match(guide, /choose `persona-lab` → \*\*New remote worktree\*\* → `main`/);
  const taskTwo = guide.split('## C — Modernize the landing page')[1].split('## D — Personalize the company')[0];
  assert.match(taskTwo, /preserve its placeholders/i);
  assert.match(taskTwo, /Do not add the prepared Persona Lab logo/);
  assert.match(taskTwo, /Show me a browser-/);
  assert.match(taskTwo, /Annotate one element/);
  assert.match(taskTwo, /build-web-apps:frontend-app-builder/);
  assert.match(guide, /🎉 \*\*Your site is live!\*\*/);
  assert.doesNotMatch(guide, /<ISSUE_URL>/);
  assert.match(guide, /Work on the issue you just created above in this Codex task/);
  assert.doesNotMatch(guide, /^## (?:Step|Task) \d/m);
});

test('the root opens the connected paper mock', async () => {
  const entry = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const paper = await readFile(new URL('mock/index.html', root), 'utf8');
  assert.match(entry, /location\.replace\('workshop\/mock\/index\.html'/);
  for (const page of ['landing', 'workspace', 'results']) assert.match(paper, new RegExp(`href="#${page}"`));
  for (const page of ['workspace', 'results']) assert.match(paper, new RegExp(`${page}\\.png`));
});

test('the landing route renders placeholders and only the annotated header action', async () => {
  const {app} = await createPrototype();
  for (const placeholder of ['BRAND_NAME', 'TAGLINE_GOES_HERE', 'COMPANY_INFO_GOES_HERE']) {
    assert.match(app.innerHTML, new RegExp(placeholder));
  }
  assert.match(app.innerHTML, /CLIENT_(?:<wbr>)?PLACEHOLDER/);
  assert.match(app.innerHTML, /TEAM_(?:<wbr>)?PLACEHOLDER/);
  assert.match(app.innerHTML, /SUPPORTER_(?:<wbr>)?PLACEHOLDER/);
  assert.match(app.innerHTML, /Simulated-persona hypotheses, not validated human research\./);
  assert.equal((app.innerHTML.match(/>Open workspace</g) || []).length, 1);
  assert.doesNotMatch(app.innerHTML.match(/<section class="hero"[\s\S]*?<\/section>/)[0], /Open workspace/);
});

test('hash navigation renders the paper journey and moves focus to the new page', async () => {
  const prototype = await createPrototype();
  prototype.navigate('#workspace');
  assert.match(prototype.app.innerHTML, /workspace\.png/);
  assert.equal(prototype.focusTarget.focusCount, 1);
  prototype.navigate('#results');
  assert.match(prototype.app.innerHTML, /results\.png/);
  assert.equal(prototype.focusTarget.focusCount, 2);
});

test('the focus indicator meets the three-to-one contrast threshold on white', async () => {
  const paper = await readFile(new URL('mock/index.html', root), 'utf8');
  const focus = paper.match(/--focus:\s*(#[\da-f]{6})/i)[1];
  assert.ok(contrastRatio(focus, '#ffffff') >= 3);
});
