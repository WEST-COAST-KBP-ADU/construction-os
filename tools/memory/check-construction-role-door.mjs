#!/usr/bin/env node

/**
 * Fail-closed checker for the Construction contour's canonical role door.
 *
 * The door's address is not asserted here. It is derived from vendored topology
 * bytes only after their Git blob SHA-1, byte size, and SHA-256 match the
 * separately reviewed source pin integrated from merged `main`. Repository,
 * source path, revision, blob identity, digest, trust boundary, and authority
 * are therefore data read from that merged anchor, never execution constants
 * in this candidate-controlled checker.
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

/** Every role surface this checker reads. */
const SURFACES = [...PATHS, README];

/** The only locally named source-identity locations. Their contents are data. */
const SOURCE_PIN_PATH = 'governance/contour/DEEDSEAL-CONTOUR-TOPOLOGY-SOURCE-PIN-v1.json';
const VENDORED_TOPOLOGY_PATH = 'governance/contour/VENDORED-DEEDSEAL-CONTOUR-TOPOLOGY-v1.json';

const SOURCE_PIN_KEYS = Object.freeze([
  'record',
  'source_repository',
  'source_path',
  'source_revision',
  'source_blob_sha1',
  'source_size_bytes',
  'source_sha256',
  'trust_boundary',
  'authority',
]);

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
  pin: `${input.pin}`,
  topology: `${input.topology}`,
  surfaces: Object.fromEntries(
    Object.entries(input.surfaces).map(([path, content]) => [path, `${content}`]),
  ),
});

/**
 * Return every top-level JSON object key, including duplicates. JSON.parse
 * intentionally discards duplicate keys, so the lexical pass is a separate
 * part of the closed-record boundary.
 */
function topLevelJsonKeys(content) {
  const keys = [];
  let objectDepth = 0;
  let arrayDepth = 0;
  let stringStart = -1;
  let escaped = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    if (stringStart >= 0) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        if (objectDepth === 1 && arrayDepth === 0) {
          let next = index + 1;
          while (/\s/.test(content[next] ?? '')) next += 1;
          if (content[next] === ':') {
            keys.push(JSON.parse(content.slice(stringStart, index + 1)));
          }
        }
        stringStart = -1;
      }
      continue;
    }

    if (character === '"') stringStart = index;
    else if (character === '{') objectDepth += 1;
    else if (character === '}') objectDepth -= 1;
    else if (character === '[') arrayDepth += 1;
    else if (character === ']') arrayDepth -= 1;
  }
  return keys;
}

/** Parse and validate the merged source pin as one closed scalar record. */
function parseSourcePin(raw, refuse) {
  if ((!Buffer.isBuffer(raw) && typeof raw !== 'string') || raw.length === 0) {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin at ${SOURCE_PIN_PATH} is missing or empty`);
    return null;
  }

  const content = Buffer.isBuffer(raw) ? raw.toString('utf8') : `${raw}`;
  let pin;
  try {
    pin = JSON.parse(content);
  } catch {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin at ${SOURCE_PIN_PATH} is malformed JSON`);
    return null;
  }

  if (!pin || typeof pin !== 'object' || Array.isArray(pin)) {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin at ${SOURCE_PIN_PATH} is not a JSON object`);
    return null;
  }

  const lexicalKeys = topLevelJsonKeys(content);
  const duplicateKeys = lexicalKeys.filter((key, index) => lexicalKeys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin repeats key(s) ${JSON.stringify([...new Set(duplicateKeys)].sort())}`);
    return null;
  }

  const actualKeys = Object.keys(pin).sort();
  const expectedKeys = [...SOURCE_PIN_KEYS].sort();
  if (actualKeys.length !== expectedKeys.length
      || actualKeys.some((key, index) => key !== expectedKeys[index])) {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin keys are ${JSON.stringify(actualKeys)}; exactly ${JSON.stringify(expectedKeys)} are required`);
    return null;
  }

  if (Object.values(pin).some((value) => value === null || !['string', 'number', 'boolean'].includes(typeof value))) {
    refuse(REFUSAL.TOPOLOGY, 'the merged source pin must contain scalar values only');
    return null;
  }

  const repositoryGrammar = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
  const pathSegments = typeof pin.source_path === 'string' ? pin.source_path.split('/') : [];
  const validPath = typeof pin.source_path === 'string'
    && /^[A-Za-z0-9._/-]+$/.test(pin.source_path)
    && !pin.source_path.startsWith('/')
    && pathSegments.length > 1
    && pathSegments.every((segment) => segment !== '' && segment !== '.' && segment !== '..');
  const invalidFields = [];
  if (pin.record !== 'DEEDSEAL-CONTOUR-TOPOLOGY-SOURCE-PIN-0001') invalidFields.push('record');
  if (typeof pin.source_repository !== 'string' || !repositoryGrammar.test(pin.source_repository)) invalidFields.push('source_repository');
  if (!validPath) invalidFields.push('source_path');
  if (typeof pin.source_revision !== 'string' || !/^[0-9a-f]{40}$/.test(pin.source_revision)) invalidFields.push('source_revision');
  if (typeof pin.source_blob_sha1 !== 'string' || !/^[0-9a-f]{40}$/.test(pin.source_blob_sha1)) invalidFields.push('source_blob_sha1');
  if (!Number.isSafeInteger(pin.source_size_bytes) || pin.source_size_bytes <= 0) invalidFields.push('source_size_bytes');
  if (typeof pin.source_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(pin.source_sha256)) invalidFields.push('source_sha256');
  if (pin.trust_boundary !== 'merged-base-pin; updates require a separate exact-source review') invalidFields.push('trust_boundary');
  if (pin.authority !== 'none') invalidFields.push('authority');
  if (invalidFields.length > 0) {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin violates its reviewed closed-record contract at ${JSON.stringify(invalidFields)}`);
    return null;
  }

  return Object.freeze({ ...pin });
}

/**
 * Derive the door's address from the vendored authority, or refuse.
 *
 * Missing, unreadable, malformed, digest-drifted, or ambiguous authority all
 * produce `CONTOUR_TOPOLOGY_DRIFT`. There is no fallback: without the pinned
 * bytes there is no address, and every address-bearing check below is skipped
 * rather than silently satisfied by a local constant.
 */
function deriveAuthority(raw, pin, refuse) {
  if ((!Buffer.isBuffer(raw) && typeof raw !== 'string') || raw.length === 0) {
    refuse(REFUSAL.TOPOLOGY, `the vendored contour topology at ${VENDORED_TOPOLOGY_PATH} is missing or empty`);
    return null;
  }

  const content = Buffer.isBuffer(raw) ? raw : Buffer.from(raw, 'utf8');
  const bytes = content.byteLength;
  const digest = createHash('sha256').update(content).digest('hex');
  const blobSha1 = createHash('sha1')
    .update(Buffer.from(`blob ${bytes}\0`, 'utf8'))
    .update(content)
    .digest('hex');
  if (bytes !== pin.source_size_bytes
      || digest !== pin.source_sha256
      || blobSha1 !== pin.source_blob_sha1) {
    refuse(REFUSAL.TOPOLOGY, `${VENDORED_TOPOLOGY_PATH} is ${bytes} bytes digesting sha256:${digest} with Git blob identity ${blobSha1}; the merged source pin for ${pin.source_repository}:${pin.source_path}@${pin.source_revision} requires ${pin.source_size_bytes} bytes digesting sha256:${pin.source_sha256} with Git blob identity ${pin.source_blob_sha1}. The vendored copy is no longer byte-identical to the reviewed source, so the door's address cannot be derived from it.`);
    return null;
  }

  let topology;
  try {
    topology = JSON.parse(content.toString('utf8'));
  } catch {
    refuse(REFUSAL.TOPOLOGY, `${VENDORED_TOPOLOGY_PATH} is not parseable JSON`);
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
async function observeSourcePin(root, refuse) {
  const path = resolve(root, SOURCE_PIN_PATH);
  let metadata;
  let raw;
  try {
    metadata = await stat(path);
    if (!metadata.isFile() || (metadata.mode & 0o444) === 0) throw new Error('unreadable source pin');
    raw = await readFile(path);
  } catch {
    refuse(REFUSAL.TOPOLOGY, `the merged source pin at ${SOURCE_PIN_PATH} is missing or unreadable; the vendored authority cannot be authenticated`);
    return null;
  }
  const pin = parseSourcePin(raw, refuse);
  return pin ? { pin, raw } : null;
}

async function observeTopology(root, pin, refuse) {
  const path = resolve(root, VENDORED_TOPOLOGY_PATH);
  let metadata;
  let raw;
  try {
    metadata = await stat(path);
    if (!metadata.isFile() || (metadata.mode & 0o444) === 0) throw new Error('unreadable authority');
    raw = await readFile(path);
  } catch {
    refuse(REFUSAL.TOPOLOGY, `the vendored contour topology at ${VENDORED_TOPOLOGY_PATH} is missing or unreadable; the door's address cannot be derived`);
    return null;
  }
  const authority = deriveAuthority(raw, pin, refuse);
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

  const pin = parseSourcePin(input.pin, refuse);
  const authority = pin ? deriveAuthority(input.topology, pin, refuse) : null;

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
  for (const path of [...SURFACES, SOURCE_PIN_PATH, VENDORED_TOPOLOGY_PATH, CHECKER]) {
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
async function runRealFileProbes(sourceRoot, authority, pin) {
  const temporary = await mkdtemp(join(tmpdir(), 'construction-role-door-'));
  try {
    const baselineRoot = resolve(temporary, 'baseline');
    await copyFixture(sourceRoot, baselineRoot);
    assertFixturePass('untouched copied tree', baselineRoot);

    const coordinatedRoot = resolve(temporary, 'all-pin-reset-attack');
    await copyFixture(sourceRoot, coordinatedRoot);
    for (const path of PATHS) {
      const target = resolve(coordinatedRoot, path);
      const content = await readFile(target, 'utf8');
      await writeFile(target, content.replaceAll(authority.role, 'role.construction.evil-director'));
    }
    const topologyPath = resolve(coordinatedRoot, VENDORED_TOPOLOGY_PATH);
    const falseTopology = (await readFile(topologyPath, 'utf8'))
      .replaceAll(authority.role, 'role.construction.evil-director');
    await writeFile(topologyPath, falseTopology);
    const resetDigest = createHash('sha256').update(falseTopology, 'utf8').digest('hex');
    const resetBytes = Buffer.byteLength(falseTopology, 'utf8');
    const resetBlobSha1 = createHash('sha1')
      .update(Buffer.from(`blob ${resetBytes}\0`, 'utf8'))
      .update(falseTopology, 'utf8')
      .digest('hex');
    const checkerPath = resolve(coordinatedRoot, CHECKER);
    const checker = await readFile(checkerPath, 'utf8');
    const resetChecker = checker
      .replaceAll(pin.source_blob_sha1, resetBlobSha1)
      .replaceAll(`${pin.source_size_bytes}`, `${resetBytes}`)
      .replaceAll(pin.source_sha256, resetDigest);
    if (falseTopology === (await readFile(resolve(sourceRoot, VENDORED_TOPOLOGY_PATH), 'utf8'))) {
      throw new Error('HOSTILE_REAL_FILE_PROBE_INERT all-pin reset: the authority mutation changed nothing');
    }
    await writeFile(checkerPath, resetChecker);
    assertFixtureRefusal('role changed on four surfaces and vendor with every checker-local byte pin reset', coordinatedRoot, REFUSAL.TOPOLOGY);

    const missingRoot = resolve(temporary, 'missing-vendored-authority');
    await copyFixture(sourceRoot, missingRoot);
    await rm(resolve(missingRoot, VENDORED_TOPOLOGY_PATH));
    assertFixtureRefusal('missing vendored authority', missingRoot, REFUSAL.TOPOLOGY);

    const unreadableRoot = resolve(temporary, 'unreadable-vendored-authority');
    await copyFixture(sourceRoot, unreadableRoot);
    await chmod(resolve(unreadableRoot, VENDORED_TOPOLOGY_PATH), 0o000);
    assertFixtureRefusal('unreadable vendored authority', unreadableRoot, REFUSAL.TOPOLOGY);

    const missingPinRoot = resolve(temporary, 'missing-source-pin');
    await copyFixture(sourceRoot, missingPinRoot);
    await rm(resolve(missingPinRoot, SOURCE_PIN_PATH));
    assertFixtureRefusal('missing merged source pin', missingPinRoot, REFUSAL.TOPOLOGY);

    const unreadablePinRoot = resolve(temporary, 'unreadable-source-pin');
    await copyFixture(sourceRoot, unreadablePinRoot);
    await chmod(resolve(unreadablePinRoot, SOURCE_PIN_PATH), 0o000);
    assertFixtureRefusal('unreadable merged source pin', unreadablePinRoot, REFUSAL.TOPOLOGY);

    const malformedPinRoot = resolve(temporary, 'malformed-source-pin');
    await copyFixture(sourceRoot, malformedPinRoot);
    await writeFile(resolve(malformedPinRoot, SOURCE_PIN_PATH), '{');
    assertFixtureRefusal('malformed merged source pin', malformedPinRoot, REFUSAL.TOPOLOGY);

    const duplicatePinRoot = resolve(temporary, 'duplicate-source-pin-key');
    await copyFixture(sourceRoot, duplicatePinRoot);
    const duplicatePinPath = resolve(duplicatePinRoot, SOURCE_PIN_PATH);
    const duplicatePin = (await readFile(duplicatePinPath, 'utf8'))
      .replace('  "authority": "none"', '  "authority": "none",\n  "authority": "none"');
    await writeFile(duplicatePinPath, duplicatePin);
    assertFixtureRefusal('duplicate merged source pin key', duplicatePinRoot, REFUSAL.TOPOLOGY);

    const extraPinRoot = resolve(temporary, 'extra-source-pin-key');
    await copyFixture(sourceRoot, extraPinRoot);
    const extraPinPath = resolve(extraPinRoot, SOURCE_PIN_PATH);
    const extraPin = (await readFile(extraPinPath, 'utf8'))
      .replace('  "authority": "none"', '  "authority": "none",\n  "candidate_override": true');
    await writeFile(extraPinPath, extraPin);
    assertFixtureRefusal('extra merged source pin key', extraPinRoot, REFUSAL.TOPOLOGY);

    const grammarPinRoot = resolve(temporary, 'grammar-invalid-source-pin');
    await copyFixture(sourceRoot, grammarPinRoot);
    const grammarPinPath = resolve(grammarPinRoot, SOURCE_PIN_PATH);
    const grammarPin = JSON.parse(await readFile(grammarPinPath, 'utf8'));
    grammarPin.source_revision = 'main';
    await writeFile(grammarPinPath, `${JSON.stringify(grammarPin, null, 2)}\n`);
    assertFixtureRefusal('grammar-invalid merged source pin', grammarPinRoot, REFUSAL.TOPOLOGY);

    const authorityPinRoot = resolve(temporary, 'authority-drifted-source-pin');
    await copyFixture(sourceRoot, authorityPinRoot);
    const authorityPinPath = resolve(authorityPinRoot, SOURCE_PIN_PATH);
    const authorityPin = JSON.parse(await readFile(authorityPinPath, 'utf8'));
    authorityPin.authority = 'candidate';
    await writeFile(authorityPinPath, `${JSON.stringify(authorityPin, null, 2)}\n`);
    assertFixtureRefusal('authority-drifted merged source pin', authorityPinRoot, REFUSAL.TOPOLOGY);

    const structuredPinRoot = resolve(temporary, 'structured-source-pin-value');
    await copyFixture(sourceRoot, structuredPinRoot);
    const structuredPinPath = resolve(structuredPinRoot, SOURCE_PIN_PATH);
    const structuredPin = JSON.parse(await readFile(structuredPinPath, 'utf8'));
    structuredPin.trust_boundary = { candidate: true };
    await writeFile(structuredPinPath, `${JSON.stringify(structuredPin, null, 2)}\n`);
    assertFixtureRefusal('non-scalar merged source pin value', structuredPinRoot, REFUSAL.TOPOLOGY);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
  return 11;
}

const replaceLast = (content, needle, replacement) => {
  const index = content.lastIndexOf(needle);
  return index < 0 ? content : content.slice(0, index) + replacement + content.slice(index + needle.length);
};

async function main() {
  const topologyErrors = [];
  const sourcePinObservation = await observeSourcePin(
    ROOT,
    (code, detail) => topologyErrors.push(`${code}: ${detail}`),
  );
  if (!sourcePinObservation) {
    for (const error of topologyErrors) process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  const observation = await observeTopology(
    ROOT,
    sourcePinObservation.pin,
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
  const baseline = { pin: sourcePinObservation.raw, surfaces, topology: observation };

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

  const realFileProbeCount = FIXTURE_CHILD ? 0 : await runRealFileProbes(
    ROOT,
    authority,
    sourcePinObservation.pin,
  );

  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_OK: 14 positive check groups, ${probes.length + realFileProbeCount} hostile probes, 0 refusals\n`);
  if (realFileProbeCount > 0) {
    process.stdout.write(`CONSTRUCTION_ROLE_DOOR_REAL_FILE_PROBES: untouched=PASS all-pin-reset=${REFUSAL.TOPOLOGY} missing-vendor=${REFUSAL.TOPOLOGY} unreadable-vendor=${REFUSAL.TOPOLOGY} missing-anchor=${REFUSAL.TOPOLOGY} unreadable-anchor=${REFUSAL.TOPOLOGY} malformed-anchor=${REFUSAL.TOPOLOGY} duplicate-anchor=${REFUSAL.TOPOLOGY} extra-key-anchor=${REFUSAL.TOPOLOGY} grammar-anchor=${REFUSAL.TOPOLOGY} authority-anchor=${REFUSAL.TOPOLOGY} scalar-anchor=${REFUSAL.TOPOLOGY} raw-stacks=0\n`);
  }
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_AUTHORITY: ${sourcePinObservation.pin.source_repository}:${sourcePinObservation.pin.source_path}@${sourcePinObservation.pin.source_revision} blob:${sourcePinObservation.pin.source_blob_sha1} sha256:${sourcePinObservation.pin.source_sha256} (vendored byte-identical at ${VENDORED_TOPOLOGY_PATH}; source pin ${SOURCE_PIN_PATH}; ${sourcePinObservation.pin.trust_boundary}; authority=${sourcePinObservation.pin.authority})\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ADDRESS: contour=${authority.contour} role=${authority.role} status=${authority.status} (derived from the pinned authority, not asserted here)\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ROUTE: ${ENTRY} -> ${authority.route}\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_COLD_START: ${REGISTRATIONS.map(([path, count]) => `${path}x${count}`).join(' ')}\n`);
  process.stdout.write('CONSTRUCTION_ROLE_DOOR_EXTERNAL_EFFECTS: none\n');
}

main().catch((error) => {
  process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error?.stack ?? error}\n`);
  process.exitCode = 1;
});
