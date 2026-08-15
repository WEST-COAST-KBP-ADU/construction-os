#!/usr/bin/env python3
"""Build the rights-clean Product 2 responsive Hero visual master in Blender 5.2.

This joins the owned A600 dimensional records with packet-authored primitives,
procedural materials/world, and the previously merged camera/motion grammar.
External assets, image textures, linked libraries, and CPU rendering are refused.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
import p2_hero_scene as base

DISCLOSURE = (
    "Conceptual A600 visualization on a representative property — not a completed "
    "project, parcel-specific fit, approved plan, permit, price, schedule, or "
    "buildability conclusion."
)


def args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--samples", type=int, default=48)
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1:])


def mat(name: str, rgba: tuple[float, float, float, float], roughness=.62,
        metallic=0.0, emission=None) -> bpy.types.Material:
    return base.material(name, rgba, metallic, roughness, emission)


def add_tree(x: float, y: float, scale: float, trunk, leaf) -> None:
    base.cylinder(f"Tree_trunk_{x}_{y}", "LOT", (x, y, scale * 1.3),
                  scale * .18, scale * 2.6, trunk)
    for i, (dx, dy, dz, s) in enumerate((
        (0, 0, 3.0, 1.0), (.65, .1, 2.65, .72), (-.55, .2, 2.7, .76),
        (.15, -.55, 2.75, .68))):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=scale*s,
            location=(x+dx*scale, y+dy*scale, dz*scale))
        o = bpy.context.object
        o.name = f"Tree_canopy_{x}_{y}_{i}"
        o.data.materials.append(leaf)
        o["source_class"] = "PACKET_PROCEDURAL_GEOMETRY"
        base.relink(o, "LOT")


def text_object(name: str, body: str, location, size: float, material,
                align="LEFT") -> bpy.types.Object:
    data = bpy.data.curves.new(name, "FONT")
    data.body = body
    data.size = size
    data.align_x = align
    data.extrude = .004
    data.materials.append(material)
    obj = bpy.data.objects.new(name, data)
    base.collection("OUTPUT_FRAMING").objects.link(obj)
    obj.location = location
    obj.rotation_euler = (math.radians(90), 0, 0)
    obj["source_class"] = "BLENDER_BUILTIN_BFONT_NO_EXTERNAL_FILE"
    return obj


def enrich(cameras: dict[str, bpy.types.Object]) -> None:
    scene = bpy.context.scene
    bone = mat("Warm_Bone", (.72, .65, .54, 1), .76)
    limestone = mat("Limestone", (.52, .46, .36, 1), .82)
    charcoal = mat("Charcoal", (.035, .044, .038, 1), .42)
    clay = mat("Restrained_Clay", (.48, .18, .09, 1), .58)
    sage = mat("Dry_Sage", (.16, .23, .105, 1), .88)
    dark_sage = mat("Tree_Sage", (.07, .14, .065, 1), .9)
    wood = mat("Warm_Wood", (.27, .13, .065, 1), .7)
    pale = mat("Editorial_Bone", (.88, .84, .74, 1), .6)

    # Replace proxy palette while preserving the owned 20 x 30 ft A600 envelope.
    for name in ("A600_PROXY_NOT_FINAL",):
        bpy.data.objects[name].data.materials[0] = bone
        bpy.data.objects[name]["ledger_records"] = (
            "A600-OWNED-EXECUTABLE-MODEL,A600-OWNED-CATALOG-RECORD,"
            "A600-OWNED-PLAN-PROFILE"
        )
    bpy.data.objects["A600_PROXY_Roof"].data.materials[0] = charcoal
    bpy.data.objects["Representative_Lot"].data.materials[0] = sage
    for n in ("Existing_House_Floor", "Existing_House_Ceiling", "Opening_Header",
              "Opening_Left", "Opening_Right"):
        bpy.data.objects[n].data.materials[0] = limestone
    # Keep the inhabited interior plane without masking the A600 gable.
    bpy.data.objects["Existing_House_Ceiling"].location.z = 5.35
    bpy.data.objects["Opening_Header"].location.z = 5.05
    bpy.data.objects["Opening_Left"].scale.z = 2.5
    bpy.data.objects["Opening_Right"].scale.z = 2.5

    # Gable roof, conceptual vertical rhythm, terrace and circulation.
    for side, rot in ((-1, math.radians(-18.435)), (1, math.radians(18.435))):
        roof = base.cube(f"A600_Gable_{side}", "ADU_VOLUME",
            (3 + side*1.52, 11, 4.47), (1.72, 4.82, .11), charcoal, .025)
        roof.rotation_euler[1] = rot
        roof["source_class"] = "A600_OWNED_Q16_DERIVATION"
    for i in range(9):
        x = .15 + i*.71
        fin = base.cube(f"A600_Siding_Rhythm_{i:02d}", "ADU_VOLUME",
            (x, 6.32, 2.05), (.018, .035, 1.72), clay, .006)
        fin["source_class"] = "PACKET_PROCEDURAL_MATERIAL_CUE"
    base.cube("A600_Terrace", "LOT", (3, 5.4, .05), (3.2, 1.0, .06), limestone, .03)
    base.cube("Yard_Circulation", "LOT", (-.25, 2.7, .06), (1.0, 3.7, .045), limestone, .03)
    for i in range(7):
        base.cube(f"Fence_Cue_{i:02d}", "LOT", (8.9, -1+i*3.5, .75),
                  (.045, 1.55, .75), wood, .02)
    add_tree(-6.8, 10.8, 1.25, wood, dark_sage)
    for i, (x, y, s) in enumerate(((-5, 5.2, .65), (-6, 7.1, .55), (7.2, 7.5, .6), (7.4, 10, .5))):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=s, location=(x,y,s*.65))
        o=bpy.context.object; o.name=f"Drought_Plant_{i:02d}"; o.scale.z=.65
        o.data.materials.append(dark_sage); o["source_class"]="PACKET_PROCEDURAL_GEOMETRY"
        base.relink(o, "LOT")

    # Causal chain: intent -> property -> design -> permits -> construction -> OS.
    stages = [(-4.9, .3), (-3.9, 2.25), (-2.15, 4.0), (-.2, 5.35), (1.55, 6.15)]
    for i, (x, y) in enumerate(stages):
        node = base.cylinder(f"Causal_{i+1:02d}", "PROJECT_GRAPH", (x,y,.22), .18, .12,
                             clay if i < 4 else charcoal)
        node.scale=(.001,)*3; node.keyframe_insert("scale", frame=34+i*7)
        node.scale=(1,)*3; node.keyframe_insert("scale", frame=39+i*7)
        if i:
            px,py=stages[i-1]
            base.curve_line(f"Causal_Link_{i:02d}", [(px,py,.23),(x,y,.23)], clay, .025)

    # Editorial physical-to-system panel, secondary and only revealed at the end.
    panel = bpy.data.objects["KBP_OS_Plane"]
    panel.data.materials[0] = charcoal
    panel.scale=(1.15,1,1.18)
    for i in range(4):
        base.cube(f"OS_Row_{i:02d}", "OUTPUT_FRAMING", (-4.25,7.36,1.2+i*.63),
                  (1.55,.025,.11), pale if i==0 else clay, .025)
    title=text_object("OS_Title", "KBP  CONSTRUCTION  OS", (-5.72,7.23,3.72), .23, pale)
    title.location.z=-1.0; title.keyframe_insert("location",frame=70)
    title.location.z=3.72; title.keyframe_insert("location",frame=96)

    scene["visual_master"] = "P2-HERO-VISUAL-MASTER-0001"
    scene["publication_disclosure"] = DISCLOSURE
    scene["a600_dimensions_m"] = "6.096 x 9.144; 9 ft plate; 4:12 gable"
    scene["production_use"] = "REFUSED"
    scene["external_dependencies"] = "NONE"
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value=(.55,.63,.66,1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.42
    bpy.data.lights["California_Daylight"].energy=4.2
    # Dedicated responsive framing: no blind center crop; roof and base remain.
    camera_specs = {
        "CAM_DESKTOP": ((-8.8, -11.8, 3.45), 36.0, (1.4, 9.0, 2.15)),
        "CAM_TABLET": ((-6.8, -13.5, 4.1), 42.0, (2.0, 9.3, 2.25)),
        "CAM_MOBILE": ((-4.6, -15.2, 4.0), 46.0, (2.7, 9.4, 2.25)),
    }
    for name, (location, lens, target) in camera_specs.items():
        cameras[name].location = location
        cameras[name].data.lens = lens
        base.point_camera(cameras[name], target)
    cameras["CAM_DESKTOP"].keyframe_insert("location", frame=1)
    cameras["CAM_DESKTOP"].location.x += .35
    cameras["CAM_DESKTOP"].location.y += .45
    cameras["CAM_DESKTOP"].keyframe_insert("location", frame=96)


def render_stills(out: Path, cameras) -> list[Path]:
    scene=bpy.context.scene; scene.frame_set(96)
    specs=(("CAM_DESKTOP",1440,900,"desktop-1440x900.png"),
           ("CAM_TABLET",820,1180,"tablet-820x1180.png"),
           ("CAM_MOBILE",390,844,"mobile-390x844.png"))
    paths=[]
    for cam,w,h,name in specs:
        scene.camera=cameras[cam]; scene.render.resolution_x=w; scene.render.resolution_y=h
        scene.render.resolution_percentage=100; scene.render.filepath=str(out/name)
        bpy.ops.render.render(write_still=True); paths.append(out/name)
    return paths


def main() -> None:
    a=args(); out=Path(a.output).resolve(); out.mkdir(parents=True,exist_ok=True)
    cameras=base.build_scene(a.samples); enrich(cameras)
    blend=out/"p2-hero-visual-master.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    stills=render_stills(out,cameras)
    contact=base.contact_sheet(out,stills)
    movie=base.render_animatic(out,cameras["CAM_DESKTOP"])
    print("KBP_VISUAL_MASTER=PASS")
    print("KBP_DISCLOSURE="+DISCLOSURE)
    for p in [blend,*stills,contact,movie]:
        print(f"KBP_ARTIFACT={p.name}:{hashlib.sha256(p.read_bytes()).hexdigest()}")


if __name__ == "__main__":
    main()
