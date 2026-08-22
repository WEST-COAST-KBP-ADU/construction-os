#!/usr/bin/env node

/**
 * Fail-closed checker for the Construction contour's canonical role door.
 *
 * It reads repository bytes only, uses the Node standard library, and runs
 * hostile probes entirely in memory. It activates no runtime and writes no
 * repository or external state.
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ENTRY = 'ENTRY.md';
const AGENTS = 'AGENTS.md';
const SESSION = 'governance/memory/SESSION-START.md';
const DIRECTOR = 'governance/office/DIRECTOR-ROLE-v1.md';
const PATHS = [ENTRY, AGENTS, SESSION, DIRECTOR];

const CONTOUR = 'CONSTRUCTION';
const ROLE = 'role.construction.operations-director';
const OWNER = 'avoroncov971-maker';
const FROZEN_RELATION = 'West Coast KBP — first user';
const COLD_START_ROUTE = 'governance/memory/SESSION-START.md';

const REFUSAL = Object.freeze({
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
});

const clone = (surfaces) => Object.fromEntries(
  Object.entries(surfaces).map(([path, content]) => [path, `${content}`]),
);

function validate(surfaces) {
  const errors = [];
  const refuse = (code, detail) => errors.push(`${code}: ${detail}`);
  const every = (predicate) => PATHS.every((path) => predicate(surfaces[path] ?? '', path));
  const joined = PATHS.map((path) => surfaces[path] ?? '').join('\n');
  const entry = surfaces[ENTRY] ?? '';

  if (!entry.startsWith(`# ENTRY · CONTOUR: ${CONTOUR} · ROLE:`)
      || !every((content) => content.includes(CONTOUR))) {
    refuse(REFUSAL.CONTOUR, `the current door and all role-entry surfaces must declare contour ${CONTOUR}`);
  }

  if (!every((content) => content.includes(ROLE))) {
    refuse(REFUSAL.ROLE, `all role-entry surfaces must carry the exact role address ${ROLE}`);
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

  if (!every((content) => content.includes(OWNER)
      && /Owner[^\n]{0,100}\b(?:alone|sole)\b/i.test(content)
      && /launch/i.test(content)
      && /approv|adopt/i.test(content)
      && /merg/i.test(content))) {
    refuse(REFUSAL.OWNER, `every role-entry surface must preserve ${OWNER} as the only launcher, approver/adopter, and merger`);
  }

  const neutral = /neutral to model and vendor|model- and vendor-neutral|model and vendor neutral/i;
  if (!every((content) => neutral.test(content))) {
    refuse(REFUSAL.NEUTRALITY, 'the role handoff must remain explicitly neutral to model and vendor');
  }

  const routeLink = '[`' + COLD_START_ROUTE + '`](' + COLD_START_ROUTE + ')';
  if (!entry.includes(routeLink)) {
    refuse(REFUSAL.ROUTE, `ENTRY.md must route directly to ${COLD_START_ROUTE}`);
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

  if (!every((content) => content.includes('referenced-not-frozen'))
      || /role status\s*:\s*`?(?:frozen|adopted|active)`?/i.test(joined)) {
    refuse(REFUSAL.ROLE_STATUS, 'the referenced Construction role must not be presented as frozen, adopted, or active');
  }

  if (!every((content) => content.includes(FROZEN_RELATION)) || joined.includes('West Coast KBP — first client')) {
    refuse(REFUSAL.FROZEN_RELATION, `the only admitted wording is ${FROZEN_RELATION}`);
  }

  if (!every((content) => ['`P1`', '`P2`', '`W1`'].every((lane) => content.includes(lane)))) {
    refuse(REFUSAL.LANES, 'the internal P1/P2/W1 lane machinery must remain explicit on every role-entry surface');
  }

  if (!every((content) => /West Coast KBP/i.test(content)
      && /\bADU\b/i.test(content)
      && /construction/i.test(content))) {
    refuse(REFUSAL.DOMAIN, 'every role-entry surface must retain the West Coast KBP / ADU and construction operational domain');
  }

  return errors;
}

function assertHostileProbe(name, baseline, mutate, expectedCode) {
  const hostile = clone(baseline);
  mutate(hostile);
  const codes = validate(hostile).map((error) => error.split(':', 1)[0]);
  if (!codes.includes(expectedCode)) {
    throw new Error(`HOSTILE_PROBE_FAILED ${name}: expected ${expectedCode}, observed ${JSON.stringify(codes)}`);
  }
}

async function main() {
  const surfaces = Object.fromEntries(await Promise.all(PATHS.map(async (path) => [
    path,
    await readFile(resolve(ROOT, path), 'utf8'),
  ])));

  const baselineErrors = validate(surfaces);
  if (baselineErrors.length > 0) {
    for (const error of baselineErrors) process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  const probes = [
    ['wrong contour', (input) => { input[ENTRY] = input[ENTRY].replace('CONTOUR: CONSTRUCTION', 'CONTOUR: ENGINEERING'); }, REFUSAL.CONTOUR],
    ['wrong role', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(ROLE, 'role.construction.general-manager'); }, REFUSAL.ROLE],
    ['legacy current door', (input) => { input[ENTRY] = input[ENTRY].replace(/^#.*$/m, '# ENTRY · ROLE: PRODUCT 2 DIRECTOR'); }, REFUSAL.LEGACY_DOOR],
    ['Product 2 promoted to contour', (input) => { input[ENTRY] += '\nProduct 2 is the current top-level contour.\n'; }, REFUSAL.PRODUCT2_CONTOUR],
    ['Owner authority lost', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(OWNER, 'Worker-338'); }, REFUSAL.OWNER],
    ['model/vendor neutrality lost', (input) => { for (const path of PATHS) input[path] = input[path].replace(/neutral to model and vendor|model- and vendor-neutral|model and vendor neutral/gi, 'runtime-specific'); }, REFUSAL.NEUTRALITY],
    ['cold-start route lost', (input) => { input[ENTRY] = input[ENTRY].replaceAll(COLD_START_ROUTE, 'governance/memory/MISSING.md'); }, REFUSAL.ROUTE],
    ['runtime falsely active', (input) => { input[ENTRY] += '\nRuntime is active.\n'; }, REFUSAL.ACTIVATION],
    ['role status overclaimed', (input) => { input[ENTRY] = input[ENTRY].replace('role status: `referenced-not-frozen`', 'role status: `active`'); }, REFUSAL.ROLE_STATUS],
    ['frozen relation widened', (input) => { for (const path of PATHS) input[path] = input[path].replaceAll(FROZEN_RELATION, 'West Coast KBP — first client'); }, REFUSAL.FROZEN_RELATION],
    ['lane board lost', (input) => { input[AGENTS] = input[AGENTS].replaceAll('`W1`', '`W2`'); }, REFUSAL.LANES],
  ];

  for (const [name, mutate, expectedCode] of probes) {
    assertHostileProbe(name, surfaces, mutate, expectedCode);
  }

  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_OK: 12 positive check groups, ${probes.length} hostile probes, 0 refusals\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ADDRESS: contour=${CONTOUR} role=${ROLE} status=referenced-not-frozen\n`);
  process.stdout.write(`CONSTRUCTION_ROLE_DOOR_ROUTE: ${ENTRY} -> ${COLD_START_ROUTE}\n`);
  process.stdout.write('CONSTRUCTION_ROLE_DOOR_EXTERNAL_EFFECTS: none\n');
}

main().catch((error) => {
  process.stderr.write(`CONSTRUCTION_ROLE_DOOR_REFUSED: ${error?.stack ?? error}\n`);
  process.exitCode = 1;
});
