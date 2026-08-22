#!/usr/bin/env node

/**
 * Fail-closed checker for the Construction contour's canonical role door.
 *
 * The door's address is not asserted here. It is derived from an immutable,
 * independently pinned authority vendored byte-identically at
 * `governance/contour/VENDORED-DEEDSEAL-CONTOUR-TOPOLOGY-v1.json` from:
 *
 *   repository : kbp-core-engineering/kbp-dev-office
 *   path       : manifests/contour/deedseal-contour-topology-v1.json
 *   revision   : d8038451c820ce0ae22b8575bbbfa7183424f79d
 *   blob sha1  : 634f8927a98db840a48bc2d8d281d9e7645f8c9b
 *   sha256     : c5170a7df374a72c740c4ccc62a93b8b91a93caf086193f19c9566affe1fb972
 *   byte count : 18515
 *
 * The vendored bytes carry no provenance of their own — that would break the
 * byte identity they exist to prove — so provenance lives here, outside them,
 * exactly as `tools/memory/check-product2-live-goal-graph.mjs` records it for
 * the vendored minimal goal contract.
 *
 * Pin reconciliation, recorded because the adopting packet states two of these
 * six values differently. Issue #341 pins `byte count: 18516` and
 * `sha256: e132395db9a274b52c1003096f89a6a802e362e1134f4c1fb8038ed821bb91dd`.
 * Those two values describe the source blob's bytes **plus one appended
 * terminating newline**, not the blob itself: appending `\n` to the vendored
 * file reproduces both exactly. The other four pins — repository, path,
 * revision and blob SHA-1 — are verified identical against live GitHub, and a
 * git blob SHA-1 fixes both the content and its 18515-byte length. The vendored
 * copy is therefore the exact source bytes the packet's imperative and its own
 * blob SHA-1 name, and `git hash-object` on it reproduces `634f8927…`.
 *
 * The checker reads repository bytes only, uses the Node standard library, and
 * runs hostile probes entirely in memory. It activates no runtime and writes no
 * repository or external state.
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ENTRY = 'ENTRY.md';
const AGENTS = 'AGENTS.md';
const SESSION = 'governance/memory/SESSION-START.md';
const DIRECTOR = 'governance/office/DIRECTOR-ROLE-v1.md';
const README = 'governance/memory/README.md';

/** The four role-entry surfaces whose address must match the pinned authority. */
const PATHS = [ENTRY, AGENTS, SESSION, DIRECTOR];

/** Every surface this checker reads. */
const SURFACES = [...PATHS, README];

export const VENDORED_TOPOLOGY = Object.freeze({
  path: 'governance/contour/VENDORED-DEEDSEAL-CONTOUR-TOPOLOGY-v1.json',
  sourceRepository: 'kbp-core-engineering/kbp-dev-office',
  sourcePath: 'manifests/contour/deedseal-contour-topology-v1.json',
  sourceRevision: 'd8038451c820ce0ae22b8575bbbfa7183424f79d',
  sourceBlobSha1: '634f8927a98db840a48bc2d8d281d9e7645f8c9b',
  sourceDigest: 'sha256:c5170a7df374a72c740c4ccc62a93b8b91a93caf086193f19c9566affe1fb972',
  sourceBytes: 18515,
});

/**
 * The only thing this repository is allowed to assert about itself: which door
 * it is. Everything else — contour key, role address, role status, cold-start
 * route, operational domain — is looked up in the pinned authority under this
 * binding and can never be supplied by a constant in this delta.
 */
const LOCAL_REPOSITORY = 'WEST-COAST-KBP-ADU/construction-os';
const LOCAL_DOOR_ENTRY = ENTRY;

const OWNER = 'avoroncov971-maker';
const FROZEN_RELATION = 'West Coast KBP — first user';
const COLD_START_COMMAND = 'node tools/memory/check-construction-role-door.mjs';
const FIXTURE_CHILD = process.env.CONSTRUCTION_ROLE_DOOR_FIXTURE_CHILD === '1';

/** Cold-start / verification surfaces, with the number of required invocations. */
const REGISTRATIONS = [
  [ENTRY, 1],
  [DIRECTOR, 1],
  [README, 1],
  [SESSION, 2],
];

const REFUSAL = Object.freeze({
  TOPOLOGY: 'CONTOUR_TOPOLOGY_DRIFT',
  CONTOUR: 'CONSTRUCTION_CONTOUR_MISSING_OR_WRONG',
  ROLE: 'CONSTRUCTION_ROLE_ADDRESS_MISSING_OR_WRONG',
  LEGACY_DOOR: 'LEGACY_PRODUCT2_CURRENT_DOOR',
  PRODUCT2_CONTOUR: 'PRODUCT2_PRESENTED_AS_TOP_LEVEL_CONTOUR',
  OWNER: 'OWNER_ONLY_AUTHORITY_MISSING',
  NEUTRALITY: 'MODEL_VENDOR_NEUTRAL_HANDOFF_MISSING',
  ROUTE: 'SESSION_START_ROUTE_MISSING',
  ACTIVATION: 'LIVE_ACTIVATION_CLAIM',
  ROLE_STATUS: 'ROLE_STATUS_OVERCLAIM',
  FROZEN_RELATION: 'FROZEN_FIRST_USER_RELATION_DRIFT',
  LANES: 'INTERNAL_LANE_MACHINERY_MISSING',
  DOMAIN: 'CONSTRUCTION_OPERATIONAL_DOMAIN_MISSING',
  REGISTRATION: 'COLD_START_REGISTRATION_MISSING',
});

const clone = (input) => ({
  topology: `${input.topology}`,
  surfaces: Object.fromEntries(
    Object.entries(input.surfaces).map(([path, content]) => [path, `${content}`]),
  ),
});

/**
 * Derive the door's address from the vendored authority, or refuse.
 *
 * Missing, unreadable, malformed, digest-drifted, or ambiguous authority all
 * produce `CONTOUR_TOPOLOGY_DRIFT`. There is no fallback: without the pinned
 * bytes there is no address, and every address-bearing check below is skipped
 * rather than silently satisfied by a local constant.
 */
function deriveAuthority(raw, refuse) {
  if ((!Buffer.isBuffer(raw) && typeof raw !== 'string') || raw.length === 0) {
    refuse(REFUSAL.TOPOLOGY, `the vendored contour topology at ${VENDORED_TOPOLOGY.path} is missing or empty`);
    return null;
  }

  const content = Buffer.isBuffer(raw) ? raw : Buffer.from(raw, 'utf8');
  const bytes = content.byteLength;
  const digest = `sha256:${createHash('sha256').update(content).digest('hex')}`;
  const blobSha1 = createHash('sha1')
    .update(Buffer.from(`blob ${bytes}\0`, 'utf8'))
    .update(content)
    .digest('hex');
  if (bytes !== VENDORED_TOPOLOGY.sourceBytes
      || digest !== VENDORED_TOPOLOGY.sourceDigest
      || blobSha1 !== VENDORED_TOPOLOGY.sourceBlobSha1) {
    refuse(REFUSAL.TOPOLOGY, `${VENDORED_TOPOLOGY.path} is ${bytes} bytes digesting ${digest} with Git blob identity ${blobSha1}; the pinned authority at ${VENDORED_TOPOLOGY.sourceRepository}@${VENDORED_TOPOLOGY.sourceRevision} is ${VENDORED_TOPOLOGY.sourceBytes} bytes digesting ${VENDORED_TOPOLOGY.sourceDigest} with Git blob identity ${VENDORED_TOPOLOGY.sourceBlobSha1}. The vendored copy is no longer byte-identical to the authority it claims to reuse, so the door's address cannot be derived from it.`);
    return null;
  }

  let topology;
  try {
    topology = JSON.parse(content.toString('utf8'));
  } catch (error) {
    refuse(REFUSAL.TOPOLOGY, `${VENDORED_TOPOLOGY.path} is not parseable JSON: ${error?.message ?? error}`);
    return null;
  }

  const contours = Array.isArray(topology?.contours) ? topology.contours : [];
  const matches = contours.filter((contour) => contour
    && typeof contour === 'object'
    && contour.door
    && typeof contour.door === 'object'
    && contour.door.repository === LOCAL_REPOSITORY
    && contour.door.entry === LOCAL_DOOR_ENTRY);

  if (matches.length !== 1) {
    refuse(REFUSAL.TOPOLOGY, `the pinned authority binds ${matches.length} contour records to the door ${LOCAL_REPOSITORY}:${LOCAL_DOOR_ENTRY}; exactly one is required`);
    return null;
  }

  const [record] = matches;
  const text = (value) => (typeof value === 'string' ? value.trim() : '');
  const authority = {
    contour: text(record.key),
    role: text(record.primary_role),
    status: text(record.role_status),
    route: text(record.door.entry_route),
    scope: text(record.scope),
  };

  for (const [field, value] of Object.entries(authority)) {
    if (!value) {
      refuse(REFUSAL.TOPOLOGY, `the pinned contour record for ${LOCAL_REPOSITORY} carries no usable '${field}'; the door's address cannot be derived`);
      return null;
    }
  }

  const keys = Array.isArray(topology?.contour_keys) ? topology.contour_keys : [];
  if (!keys.includes(authority.contour)) {
    refuse(REFUSAL.TOPOLOGY, `the pinned contour key '${authority.contour}' is not one of the authority's declared contour keys ${JSON.stringify(keys)}`);
    return null;
  }

  if (!Array.isArray(record.repositories) || !record.repositories.includes(LOCAL_REPOSITORY)) {
    refuse(REFUSAL.TOPOLOGY, `the pinned contour record for door ${LOCAL_REPOSITORY} does not list ${LOCAL_REPOSITORY} among its repositories`);
    return null;
  }

  if (authority.route !== SESSION) {
    refuse(REFUSAL.TOPOLOGY, `the pinned authority routes this door to '${authority.route}', not to the cold start this repository ships at '${SESSION}'`);
    return null;
  }

  // The operational-domain tokens are read out of the authority's own scope
  // sentence, so they cannot be softened by editing this file.
  authority.domainTokens = ['ADU', 'construction'].filter((token) => authority.scope.includes(token));
  if (authority.domainTokens.length !== 2) {
    refuse(REFUSAL.TOPOLOGY, `the pinned contour scope does not name the ADU and construction operational domain: ${JSON.stringify(authority.scope)}`);
    return null;
  }

  return authority;
}

/**
 * Observe the vendored authority as one total, fail-closed boundary. Filesystem
 * failures are deliberately not reflected verbatim: platform error codes and
 * stacks are implementation details, while every failed authority observation
 * has the one stable public meaning `CONTOUR_TOPOLOGY_DRIFT`.
 */
async function observeTopology(root, refuse) {
  const path = resolve(root, VENDORED_TOPOLOGY.path);
  let metadata;
  let raw;
  try {
    metadata = await stat(path);
    if (!metadata.isFile() || (metadata.mode & 0o444) === 0) throw new Error('unreadable authority');
    raw = await readFile(path);
  } catch {
    refuse(REFUSAL.TOPOLOGY, `the vendored contour topology at ${VENDORED_TOPOLOGY.path} is missing or unreadable; the door's address cannot be derived`);
    return null;
  }
  const authority = deriveAuthority(raw, refuse);
  return authority ? raw : null;
}

/**
 * Segment a markdown surface into assertion units: one bullet, table cell, or
 * sentence each. An Owner-only authority claim must live inside a single unit,
 * so unrelated prose elsewhere in the file cannot lend it a verb it lacks.
 */
export function assertionUnits(content) {
  const blocks = [];
  let current = [];
  const flush = () => {
    if (current.length > 0) blocks.push(current.join(' '));
    current = [];
  };

  for (const rawLine of `${content}`.split('\n')) {
    const line = rawLine.trim();
    const startsBlock = line === ''
      || /^#{1,6}\s/.test(line)
      || /^```/.test(line)
      || /^(?:[-*+]|\d+\.)\s/.test(line)
      || /^\|/.test(line)
      || /^>/.test(line);
    if (startsBlock) {
      flush();
      if (line === '') continue;
    }
    current.push(line);
  }
  flush();

  return blocks
    .flatMap((block) => (block.startsWith('|') ? block.split('|') : [block]))
    .flatMap((chunk) => chunk.split(/(?<=\.)\s+/))
    .map((unit) => unit.trim())
    .filter((unit) => unit.length > 0);
}

const OWNER_VERBS = Object.freeze({
  launch: /\blaunch(?:es|ed|ing)?\b/i,
  'approve/adopt': /\b(?:approves?|approval|approving|adopts?|adoption|adopting)\b/i,
  merge: /\bmerges?\b/i,
});

/**
 * Return the Owner-only authority verbs that no single Owner assertion binds on
 * this surface. An assertion qualifies only if it names the Owner login, scopes
 * it with `alone`/`sole`, and carries the verb itself.
 */
function unboundOwnerVerbs(content) {
  const claims = assertionUnits(content).filter((unit) => unit.includes(OWNER)
    && /\b(?:alone|sole)\b/i.test(unit));
  const names = Object.keys(OWNER_VERBS);
  if (claims.length === 0) return names;

  for (const claim of claims) {
    const missing = names.filter((name) => !OWNER_VERBS[name].test(claim));
    if (missing.length === 0) return [];
  }

  // Report the closest near-miss so the refusal names a repairable gap.
  return claims
    .map((claim) => names.filter((name) => !OWNER_VERBS[name].test(claim)))
    .sort((a, b) => a.length - b.length)[0];
}

export function validate(input) {
  const errors = [];
  const refuse = (code, detail) => errors.push(`${code}: ${detail}`);
  const surfaces = input.surfaces ?? {};
  const every = (predicate) => PATHS.every((path) => predicate(surfaces[path] ?? '', path));
  const joined = PATHS.map((path) => surfaces[path] ?? '').join('\n');
  const entry = surfaces[ENTRY] ?? '';

  const authority = deriveAuthority(input.topology, refuse);

  if (authority) {
    if (!entry.startsWith(`# ENTRY · CONTOUR: ${authority.contour} · ROLE:`)
        || !every((content) => content.includes(authority.contour))) {
      refuse(REFUSAL.CONTOUR, `the current door and all role-entry surfaces must declare the pinned contour ${authority.contour}`);
    }

    if (!every((content) => content.includes(authority.role))) {
      refuse(REFUSAL.ROLE, `all role-entry surfaces must carry the pinned role address ${authority.role}`);
    }

    if (!every((content) => content.includes(authority.status))
        || /role status\s*:\s*`?(?:frozen|adopted|active)`?/i.test(joined)) {
      refuse(REFUSAL.ROLE_STATUS, `the referenced Construction role must be presented exactly at its pinned status ${authority.status}, never as frozen, adopted, or active`);
    }

    const routeLink = '[`' + authority.route + '`](' + authority.route + ')';
    if (!entry.includes(routeLink)) {
      refuse(REFUSAL.ROUTE, `ENTRY.md must route directly to the pinned cold start ${authority.route}`);
    }

    if (!every((content) => /West Coast KBP/i.test(content)
        && /\bADU\b/.test(content)
        && /construction/i.test(content))) {
      refuse(REFUSAL.DOMAIN, `every role-entry surface must retain the West Coast KBP / ${authority.domainTokens.join(' and ')} operational domain, with the operational-domain token \`ADU\` in uppercase; lowercase legacy text such as \`product-adu\` does not satisfy it`);
    }
  }

  if (/^#.*PRODUCT 2 DIRECTOR|role\s*:\s*PRODUCT 2 DIRECTOR/im.test(entry)) {
    refuse(REFUSAL.LEGACY_DOOR, 'ENTRY.md still titles or declares the current role as PRODUCT 2 DIRECTOR');
  }

  const product2AsContour = [
    /contour\s*:\s*`?PRODUCT[_ ]?2`?/i,
    /Product 2 is (?:the )?current top-level contour/i,
    /current top-level contour (?:is|:) `?Product 2`?/i,
  ];
  if (product2AsContour.some((pattern) => pattern.test(joined))) {
    refuse(REFUSAL.PRODUCT2_CONTOUR, 'Product 2 is business/product vocabulary inside Construction, not a current top-level contour');
  }

  for (const path of PATHS) {
    const content = surfaces[path] ?? '';
    if (!content.includes(OWNER)) {
      refuse(REFUSAL.OWNER, `${path} must name ${OWNER} as the Owner`);
      continue;
    }
    const missing = unboundOwnerVerbs(content);
    if (missing.length > 0) {
      refuse(REFUSAL.OWNER, `${path} carries no single Owner-only assertion binding ${missing.join(', ')} to ${OWNER} alone; an occurrence elsewhere in the file does not bind it`);
    }
  }

  const neutral = /neutral to model and vendor|model- and vendor-neutral|model and vendor neutral/i;
  if (!every((content) => neutral.test(content))) {
    refuse(REFUSAL.NEUTRALITY, 'the role handoff must remain explicitly neutral to model and vendor');
  }

  const liveClaims = [
    /PostgreSQL hydration (?:is|already is|is already) live/i,
    /runtime (?:is|is already|has been) (?:active|activated|live)/i,
    /credentials (?:are|are already|have been) (?:active|loaded|granted|available)/i,
    /(?:business|external|business (?:or|and) external) effects (?:are|are already|have been) (?:active|enabled|live)/i,
  ];
  if (liveClaims.some((pattern) => pattern.test(joined))) {
    refuse(REFUSAL.ACTIVATION, 'a role address cannot claim PostgreSQL, runtime, credentials, or business effects are live');
  }
  if (!every((content) => /does not hydrate PostgreSQL[\s\S]{0,120}activate runtime[\s\S]{0,120}(?:grant\s+)?credentials[\s\S]{0,160}(?:business|external) effects/i.test(content))) {
    refuse(REFUSAL.ACTIVATION, 'every role-entry surface must state the non-activation boundary');
  }

  if (!every((content) => content.includes(FROZEN_RELATION)) || joined.includes('West Coast KBP — first client')) {
    refuse(REFUSAL.FROZEN_RELATION, `the only admitted wording is ${FROZEN_RELATION}`);
  }

  if (!every((content) => ['`P1`', '`P2`', '`W1`'].every((lane) => content.includes(lane)))) {
    refuse(REFUSAL.LANES, 'the internal P1/P2/W1 lane machinery must remain explicit on every role-entry surface');
  }

  for (const [path, required] of REGISTRATIONS) {
    const content = surfaces[path] ?? '';
    const found = content.split(COLD_START_COMMAND).length - 1;
    if (found < required) {
      refuse(REFUSAL.REGISTRATION, `${path} invokes \`${COLD_START_COMMAND}\` ${found} time(s); the cold-start and verification sequence requires ${required}`);
    }
  }

  return { errors, authority };
}

function assertHostileProbe(name, baseline, mutate, expectedCode) {
  const hostile = clone(baseline);
  mutate(hostile.surfaces, hostile);
  if (hostile.topology === baseline.topology
      && PATHS.concat(README).every((path) => hostile.surfaces[path] === baseline.surfaces[path])) {
    throw new Error(`HOSTILE_PROBE_INERT ${name}: the mutation changed nothing, so it proves nothing`);
  }
  const codes = validate(hostile).errors.map((error) => error.split(':', 1)[0]);
  if (!codes.includes(expectedCode)) {
    throw new Error(`HOSTILE_PROBE_FAILED ${name}: expected ${expectedCode}, observed ${JSON.stringify(codes)}`);
  }
}

const CHECKER = 'tools/memory/check-construction-role-door.mjs';

async function copyFixture(sourceRoot, fixtureRoot) {
  for (const path of [...SURFACES, VENDORED_TOPOLOGY.path, CHECKER]) {
    await mkdir(dirname(resolve(fixtureRoot, path)), { recursive: true });
    await copyFile(resolve(sourceRoot, path), resolve(fixtureRoot, path));
  }
}

function runFixture(fixtureRoot) {
  return spawnSync(process.execPath, [resolve(fixtureRoot, CHECKER)], {
    cwd: fixtureRoot,
    encoding: 'utf8',
    env: { ...process.env, CONSTRUCTION_ROLE_DOOR_FIXTURE_CHILD: '1' },
    timeout: 60_000,
  });
}

function assertFixturePass(name, fixtureRoot) {
  const result = runFixture(fixtureRoot);
  if (result.status !== 0 || !result.stdout.includes('CONSTRUCTION_ROLE_DOOR_OK:')) {
    throw new Error(`HOSTILE_REAL_FILE_BASELINE_FAILED ${name}: status=${result.status} stdout=${JSON.stringify(result.stdout)} stderr=${JSON.stringify(result.stderr)}`);
  }
}

function assertFixtureRefusal(name, fixtureRoot, expectedCode) {
  const result = runFixture(fixtureRoot);
  const output = `${result.stdout}${result.stderr}`;
  const namedRefusal = `CONSTRUCTION_ROLE_DOOR_REFUSED: ${expectedCode}:`;
  if (result.status === 0 || !output.includes(namedRefusal)) {
    throw new Error(`HOSTILE_REAL_FILE_PROBE_FAILED ${name}: expected ${namedRefusal}, status=${result.status}, stdout=${JSON.stringify(result.stdout)} stderr=${JSON.stringify(result.stderr)}`);
  }
  if (/\b(?:ENOENT|EACCES|EISDIR)\b|(?:^|\n)\s+at\s/.test(output)) {
    throw new Error(`HOSTILE_REAL_FILE_RAW_STACK ${name}: a platform error or raw stack escaped the stable refusal: ${JSON.stringify(output)}`);
  }
}

/**
 * Exercise the checker as a process over disposable real files. The untouched
 * fixture must pass before any mutation; each attack must then emit the exact
 * topology refusal without a raw filesystem code or stack.
 */
async function runRealFileProbes(sourceRoot, authority) {
  const temporary = await mkdtemp(join(tmpdir(), 'construction-role-door-'));
  try {
    const baselineRoot = resolve(temporary, 'baseline');
    await copyFixture(sourceRoot, baselineRoot);
    assertFixturePass('untouched copied tree', baselineRoot);

    const coordinatedRoot = resolve(temporary, 'coordinated-false-authority');
    await copyFixture(sourceRoot, coordinatedRoot);
    for (const path of PATHS) {
      const target = resolve(coordinatedRoot, path);
      const content = await readFile(target, 'utf8');
      await writeFile(target, content.replaceAll(authority.role, 'role.construction.false-director'));
    }
    const topologyPath = resolve(coordinatedRoot, VENDORED_TOPOLOGY.path);
    const falseTopology = (await readFile(topologyPath, 'utf8'))
      .replaceAll(authority.role, 'role.construction.false-director');
    await writeFile(topologyPath, falseTopology);
    const resetDigest = `sha256:${createHash('sha256').update(falseTopology, 'utf8').digest('hex')}`;
    const resetBytes = Buffer.byteLength(falseTopology, 'utf8');
    const checkerPath = resolve(coordinatedRoot, CHECKER);
    const checker = await readFile(checkerPath, 'utf8');
    const resetChecker = checker
      .replace(/sourceDigest: 'sha256:[0-9a-f]{64}'/, `sourceDigest: '${resetDigest}'`)
      .replace(/sourceBytes: \d+/, `sourceBytes: ${resetBytes}`);
    if (resetChecker === checker
        || falseTopology === (await readFile(resolve(sourceRoot, VENDORED_TOPOLOGY.path), 'utf8'))) {
      throw new Error('HOSTILE_REAL_FILE_PROBE_INERT coordinated false authority: the attack changed nothing');
    }
    await writeFile(checkerPath, resetChecker);
    assertFixtureRefusal('coordinated false role, topology, size, and SHA-256', coordinatedRoot, REFUSAL.TOPOLOGY);

    const missingRoot = resolve(temporary, 'missing-authority');
    await copyFixture(sourceRoot, missingRoot);
    await rm(resolve(missingRoot, VENDORED_TOPOLOGY.path));
    assertFixtureRefusal('missing vendored authority', missingRoot, REFUSAL.TOPOLOGY);

    const unreadableRoot = resolve(temporary, 'unreadable-authority');
    await copyFixture(sourceRoot, unreadableRoot);
    await chmod(resolve(unreadableRoot, VENDORED_TOPOLOGY.path), 0o000);
    assertFixtureRefusal('unreadable vendored authority', unreadableRoot, REFUSAL.TOPOLOGY);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  return 3;
}

const replaceLast = (content, needle, replacement) => {
  const index = content.lastIndexOf(needle);
  return index < 0 ? content : content.slice(0, index) + replacement + content.slice(index + needle.length);
};

async function main() {
  const topologyErrors = [];
  const observation = await observeTopology(
    ROOT,
    (code, detail) => topologyErrors.push(`${code}: ${detail}`),
  );
  if (!observation) {
    for (const error of topologyErrors) process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  const surfaces = Object.fromEntries(await Promise.all(SURFACES.map(async (path) => [
    path,
    await readFile(resolve(ROOT, path), 'utf8'),
  ])));
  const baseline = { surfaces, topology: observation };

  const { errors: baselineErrors, authority } = validate(baseline);
  if (baselineErrors.length > 0) {
    for (const error of baselineErrors) process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  const probes = [
    ['wrong contour', (input) => { input[ENTRY] = input[ENTRY].replace(`CONTOUR: ${authority.contour}`, 'CONTOUR: ENGINEERING'); }, REFUSAL.CONTOUR],
    ['wrong role', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(authority.role, 'role.construction.general-manager'); }, REFUSAL.ROLE],
    ['legacy current door', (input) => { input[ENTRY] = input[ENTRY].replace(/^#.*$/m, '# ENTRY · ROLE: PRODUCT 2 DIRECTOR'); }, REFUSAL.LEGACY_DOOR],
    ['Product 2 promoted to contour', (input) => { input[ENTRY] += '\nProduct 2 is the current top-level contour.\n'; }, REFUSAL.PRODUCT2_CONTOUR],
    ['Owner identity lost', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(OWNER, 'Worker-341'); }, REFUSAL.OWNER],
    ['Owner assertion loses launch authority', (input) => { input[DIRECTOR] = input[DIRECTOR].replace('launches it, adopts or approves', 'adopts or approves'); }, REFUSAL.OWNER],
    ['Owner assertion loses approval/adoption authority', (input) => { input[DIRECTOR] = input[DIRECTOR].replace(', adopts or approves material decisions,', ','); }, REFUSAL.OWNER],
    ['Owner assertion loses merge authority', (input) => { input[DIRECTOR] = input[DIRECTOR].replace('material decisions, and merges.', 'material decisions.'); }, REFUSAL.OWNER],
    ['model/vendor neutrality lost', (input) => { for (const path of PATHS) input[path] = input[path].replace(/neutral to model and vendor|model- and vendor-neutral|model and vendor neutral/gi, 'runtime-specific'); }, REFUSAL.NEUTRALITY],
    ['cold-start route lost', (input) => { input[ENTRY] = input[ENTRY].replaceAll(authority.route, 'governance/memory/MISSING.md'); }, REFUSAL.ROUTE],
    ['runtime falsely active', (input) => { input[ENTRY] += '\nRuntime is active.\n'; }, REFUSAL.ACTIVATION],
    ['role status overclaimed', (input) => { input[ENTRY] = input[ENTRY].replace(`role status: \`${authority.status}\``, 'role status: `active`'); }, REFUSAL.ROLE_STATUS],
    ['frozen relation widened', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(FROZEN_RELATION, 'West Coast KBP — first client'); }, REFUSAL.FROZEN_RELATION],
    ['lane board lost', (input) => { input[AGENTS] = input[AGENTS].replaceAll('`W1`', '`W2`'); }, REFUSAL.LANES],
    ['operational domain lost, legacy lowercase product-adu left intact', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll('ADU', 'DWELLING'); }, REFUSAL.DOMAIN],
    ['vendored authority bytes altered', (input, state) => { state.topology = state.topology.replace('"referenced-not-frozen"', '"frozen"'); }, REFUSAL.TOPOLOGY],
    ['vendored authority unparseable', (input, state) => { state.topology = state.topology.slice(0, 4096); }, REFUSAL.TOPOLOGY],
    ['role relabelled on every surface and in the vendored authority together', (input, state) => {
      for (const path of PATHS) input[path] = input[path].replaceAll(authority.role, 'role.construction.general-manager');
      state.topology = state.topology.replaceAll(authority.role, 'role.construction.general-manager');
    }, REFUSAL.TOPOLOGY],
    ['cold-start registration removed from ENTRY.md', (input) => { input[ENTRY] = input[ENTRY].replaceAll(COLD_START_COMMAND, ''); }, REFUSAL.REGISTRATION],
    ['cold-start registration removed from DIRECTOR-ROLE-v1.md', (input) => { input[DIRECTOR] = input[DIRECTOR].replaceAll(COLD_START_COMMAND, ''); }, REFUSAL.REGISTRATION],
    ['cold-start registration removed from governance/memory/README.md', (input) => { input[README] = input[README].replaceAll(COLD_START_COMMAND, ''); }, REFUSAL.REGISTRATION],
    ['first SESSION-START.md registration removed, second left intact', (input) => { input[SESSION] = input[SESSION].replace(COLD_START_COMMAND, ''); }, REFUSAL.REGISTRATION],
    ['second SESSION-START.md registration removed, first left intact', (input) => { input[SESSION] = replaceLast(input[SESSION], COLD_START_COMMAND, ''); }, REFUSAL.REGISTRATION],
  ];

  for (const [name, mutate, expectedCode] of probes) {
    assertHostileProbe(name, baseline, mutate, expectedCode);
  }

  const realFileProbeCount = FIXTURE_CHILD ? 0 : await runRealFileProbes(ROOT, authority);

  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_OK: 14 positive check groups, ${probes.length + realFileProbeCount} hostile probes, 0 refusals\n`);
  if (realFileProbeCount > 0) {
    process.stdout.write(`CONSTRUCTION_ROLE_DOOR_REAL_FILE_PROBES: untouched=PASS coordinated-false-authority=${REFUSAL.TOPOLOGY} missing-authority=${REFUSAL.TOPOLOGY} unreadable-authority=${REFUSAL.TOPOLOGY} raw-stacks=0\n`);
  }
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_AUTHORITY: ${VENDORED_TOPOLOGY.sourceRepository}@${VENDORED_TOPOLOGY.sourceRevision} blob:${VENDORED_TOPOLOGY.sourceBlobSha1} ${VENDORED_TOPOLOGY.sourceDigest} (vendored byte-identical at ${VENDORED_TOPOLOGY.path})\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ADDRESS: contour=${authority.contour} role=${authority.role} status=${authority.status} (derived from the pinned authority, not asserted here)\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ROUTE: ${ENTRY} -> ${authority.route}\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_COLD_START: ${REGISTRATIONS.map(([path, count]) => `${path}x${count}`).join(' ')}\n`);
  process.stdout.write('CONSTRUCTION_ROLE_DOOR_EXTERNAL_EFFECTS: none\n');
}

main().catch((error) => {
  process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error?.stack ?? error}\n`);
  process.exitCode = 1;
});
