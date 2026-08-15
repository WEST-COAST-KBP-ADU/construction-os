# P2 Hero Blender camera and motion system

Status: pre-production technical visual-system evidence for
`work.product2-hero-blender-camera-motion-recovery-0001`. This is not a final
Hero, an admitted source package, a rights decision, or Production approval.

## Outcome and boundary

The editable Blender 5.2 system translates the Owner-selected synthesis into
one causal spatial sequence: inhabited existing-house foreground and lot,
planning intelligence, design/permit/construction stages, then a secondary KBP
OS plane. The physical detached ADU remains the subject. The graph describes
project progression in the scene; it is not decorative interface wallpaper.

Every building and parcel element is neutral proxy massing. `A600_PROXY_NOT_FINAL`
is a concept-only 20 × 30 ft envelope and must never be represented as the final
A600. The lot is representative and carries no address, parcel, zoning,
buildability, permit, price, schedule, construction-completion, or publication
claim. Final geometry, real-lot source, material truth, likeness and publication
rights remain governed by the physical-truth join input.

## Editable system

`tools/visual/p2_hero_scene.py` deterministically rebuilds the scene from code
with these separate collections:

- `LOT`, `EXISTING_HOUSE`, and `ADU_VOLUME` contain disclosed proxy massing;
- `PLANNING_LAYER` contains the bounded lot-to-ADU path;
- `PROJECT_GRAPH` contains four ordered causal stage markers;
- `CAMERA_RIGS` contains authored 1440 × 900, 820 × 1180 and 390 × 844 rigs;
- `LIGHTING` contains a neutral daylight sun/world/fill rig;
- `OUTPUT_FRAMING` contains the secondary interface-emergence plane.

The builder fixes the timeline at 24 fps / frames 1–96, disables denoising,
uses fixed samples, and contains no random geometry or procedural seed drift.
It refuses execution unless Blender Cycles binds `OPTIX` or `CUDA` and the scene
device is `GPU`. CPU is an error, never a fallback.

## Camera, light, material and framing rules

- Desktop uses 34 mm from inside the main-house foreground and preserves calm
  negative space left of the detached ADU proxy.
- Tablet uses 38 mm and keeps the ADU above the fold while retaining the causal
  planning path below it.
- Mobile uses 45 mm, centers the subject, and keeps existing-house foreground,
  yard and detached ADU as separate planes.
- Lighting is neutral California daytime: one restrained sun, soft interior
  fill and low-strength blue daylight world. There is no neon or cyberpunk
  palette.
- Materials are deliberately matte proxy classes. No James Hardie, glazing,
  landscape, completed-project or final-A600 likeness claim is made.
- The KBP OS plane is secondary: it rises only at frames 71–96, after the
  physical lot and product composition is established.

## Motion grammar

The exact timeline is recorded in `p2-hero-motion-contract-v1.json`. Motion is
finite and causal: camera settle, site path reveal, ordered project stages and
interface emergence. There is no ambient loop, random dashboard card, HUD,
decorative node network, moving logo or static-house-only composition.

Reduced motion uses a direct dissolve between the same frame-71 and frame-96
states. No-motion uses frame 96 as the poster. Both retain the same causal
meaning and intended Studio entry without forced camera travel.

## Remote execution and evidence contract

Production execution uses the already Owner-authorized Lambda surface as a
replaceable compute executor. The adopted studio validator must pass while
retaining its truthful `PRODUCTION_USE: REFUSED` state. The adopted doctor must
return `DOCTOR_PASS` with Blender 5.2 and NVIDIA A10 before any render.

The generated `.blend`, stills, contact sheet, transition frames, movie, caches
and logs remain outside Git. Required bytes are pulled from ephemeral Lambda
storage before the worker stops, and local SHA-256 digests identify the exact
returned artifacts. Machine address, hostname, username and secrets are not
recorded. The worker neither reconfigures nor terminates the provider instance.

### Worker-327 execution evidence

- Fresh adopted doctor: `DOCTOR_PASS`; Blender 5.2.0 LTS and NVIDIA A10
  (23,028 MiB) observed.
- Render binding: `KBP_CYCLES_BACKEND=CUDA`, `KBP_SCENE_DEVICE=GPU`,
  `KBP_CYCLES_DEVICE=CUDA:NVIDIA A10`; the final driver witness sampled a live
  Blender GPU process 20 times. OptiX initialization was unavailable, so the
  accepted CUDA backend was selected; CPU fallback remained refused.
- Returned artifact directory: `~/kbp-artifacts/p2-hero-blender-camera-motion-recovery-0001/`
  outside Git. It includes the `.blend`, all three stills, contact sheet,
  26 transition frames, MP4, artifact JSON and sanitized render/GPU logs.
- `p2-hero-system.blend` — `157a3619a3109aefa11d549808520d5edd8fff8ec543a90120ba649d44d4d345`
- `desktop-1440x900.png` — `f00636165e5cc98ec4811b99315cc9637a56acfd0859f089173bc5f31d2a8f08`
- `tablet-820x1180.png` — `72f615826d1e8f7cb967631f1cf038c70518cea303ca6da62c73c8020df66b0b`
- `mobile-390x844.png` — `c6b322a0a45985875a0f0cc48745e00e4f3221e0417ecc326457fc88146f20b9`
- `responsive-contact-sheet.png` — `00ac471e6df1374a3f23ba5f007112794e0ab1b814962b85d8927b974549d6f1`
- `first-transition.mp4` — `4add90a4c755c56bcc73dfa25e3038c09caf837c7cfc6edbb51c0686cd246753`

The returned images identify as exactly 1440 × 900, 820 × 1180 and 390 × 844.
The returned animatic identifies as 960 × 600, 24 fps and 26 frames. The
responsive contact sheet was visually inspected after return; it shows the
open existing-house foreground, separate yard and detached proxy, causal path,
and stable subject framing across the three crops.

Targeted JSON parsing, Python compilation, the Product 2 live-goal-graph check
(21 groups, 0 refusals), ESLint, Next.js production build and `git diff --check`
passed. Full Vitest was attempted normally and once with one worker; both runs
were refused by the host with `Unknown system error -122` before suite import
(46 files, 0 tests), the same environment refusal observed by Worker-324. No
product assertion ran or failed.

## Join disposition

This branch can contribute the editable camera/motion system and proxy-classified
technical previews. It cannot clear the sibling's terminal blocker: no
rights-complete real California existing-house/backyard source is admitted, and
the existing composite lacks an explicit publication/derivative grant. The
visual master remains blocked until that physical/source-rights fact is resolved
by Owner-authorized evidence.
