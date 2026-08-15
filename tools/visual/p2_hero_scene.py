#!/usr/bin/env python3
"""Deterministic Blender 5.2 scene builder for the Product 2 Hero visual join.

All architecture and lot geometry is visibly neutral proxy massing. This script
does not admit source rights, create a final A600, or produce a public master.
It fails closed unless Cycles binds an NVIDIA GPU through OPTIX or CUDA.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import bpy
from mathutils import Vector

SEED = 327
COLLECTIONS = (
    "LOT", "EXISTING_HOUSE", "ADU_VOLUME", "PLANNING_LAYER",
    "PROJECT_GRAPH", "CAMERA_RIGS", "LIGHTING", "OUTPUT_FRAMING",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True, help="Output directory outside Git")
    parser.add_argument("--mode", choices=("build", "stills", "animatic", "all"), default="all")
    parser.add_argument("--samples", type=int, default=24)
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.frame_start, scene.frame_end, scene.render.fps = 1, 96, 24
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    for name in COLLECTIONS:
        collection = bpy.data.collections.new(name)
        scene.collection.children.link(collection)


def collection(name: str) -> bpy.types.Collection:
    return bpy.data.collections[name]


def relink(obj: bpy.types.Object, target: str) -> None:
    for owner in list(obj.users_collection):
        owner.objects.unlink(obj)
    collection(target).objects.link(obj)


def material(name: str, color: tuple[float, float, float, float], metallic: float = 0.0,
             roughness: float = 0.65, emission: tuple[float, float, float, float] | None = None) -> bpy.types.Material:
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = 1.6
    return mat


def cube(name: str, target: str, location: tuple[float, float, float], scale: tuple[float, float, float], mat: bpy.types.Material,
         bevel: float = 0.0) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name, obj.scale = name, scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Restrained edge", "BEVEL")
        modifier.width, modifier.segments = bevel, 3
    obj.data.materials.append(mat)
    obj["source_class"] = "PROXY"
    relink(obj, target)
    return obj


def cylinder(name: str, target: str, location: tuple[float, float, float], radius: float, depth: float,
             mat: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    obj["source_class"] = "DERIVED_TECHNICAL"
    relink(obj, target)
    return obj


def curve_line(name: str, points: list[tuple[float, float, float]], mat: bpy.types.Material, bevel: float = 0.035) -> bpy.types.Object:
    data = bpy.data.curves.new(name, "CURVE")
    data.dimensions, data.bevel_depth, data.bevel_resolution = "3D", bevel, 3
    spline = data.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, co in zip(spline.points, points):
        point.co = (*co, 1.0)
    obj = bpy.data.objects.new(name, data)
    data.materials.append(mat)
    collection("PLANNING_LAYER").objects.link(obj)
    obj["source_class"] = "DERIVED_TECHNICAL"
    return obj


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def configure_gpu(samples: int) -> str:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "GPU"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = False
    prefs = bpy.context.preferences.addons["cycles"].preferences
    selected = None
    for backend in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = backend
            prefs.get_devices()
            gpu_devices = [d for d in prefs.devices if d.type == backend]
            if gpu_devices:
                for device in prefs.devices:
                    device.use = device in gpu_devices
                selected = backend
                break
        except Exception:
            continue
    if selected not in {"OPTIX", "CUDA"} or scene.cycles.device != "GPU":
        raise RuntimeError("CPU_FALLBACK_REFUSED: no accepted OPTIX/CUDA Cycles GPU")
    print("KBP_CYCLES_BACKEND=" + selected)
    print("KBP_SCENE_DEVICE=" + scene.cycles.device)
    for device in prefs.devices:
        if device.use:
            print("KBP_CYCLES_DEVICE=" + device.type + ":" + device.name)
    return selected


def build_scene(samples: int) -> dict[str, bpy.types.Object]:
    reset_scene()
    backend = configure_gpu(samples)
    warm = material("Proxy_Warm_Plaster", (0.55, 0.47, 0.37, 1))
    ground = material("Proxy_Lot_Sage", (0.17, 0.25, 0.13, 1))
    adu = material("Proxy_A600_Not_Final", (0.18, 0.22, 0.20, 1), roughness=0.48)
    glass = material("Proxy_Glass_Dark", (0.025, 0.055, 0.07, 1), metallic=0.12, roughness=0.22)
    line = material("Planning_Amber", (0.88, 0.42, 0.08, 1), emission=(0.88, 0.22, 0.03, 1))
    graph = material("Project_Charcoal", (0.05, 0.07, 0.065, 1), metallic=0.1, roughness=0.35)
    ui = material("KBP_OS_Secondary", (0.055, 0.11, 0.10, 1), metallic=0.25, roughness=0.28, emission=(0.03, 0.18, 0.14, 1))

    cube("Representative_Lot", "LOT", (0, 3, -0.18), (9.5, 15, 0.18), ground)
    cube("Existing_House_Floor", "EXISTING_HOUSE", (0, -5.5, 0.08), (8.8, 3.4, 0.08), warm, 0.03)
    cube("Existing_House_Ceiling", "EXISTING_HOUSE", (0, -5.5, 4.08), (8.8, 3.4, 0.08), warm, 0.03)
    cube("Opening_Header", "EXISTING_HOUSE", (0, -2.15, 3.65), (8.7, 0.22, 0.28), warm)
    cube("Opening_Left", "EXISTING_HOUSE", (-8.45, -2.15, 1.85), (0.28, 0.22, 1.85), warm)
    cube("Opening_Right", "EXISTING_HOUSE", (8.45, -2.15, 1.85), (0.28, 0.22, 1.85), warm)
    cube("A600_PROXY_NOT_FINAL", "ADU_VOLUME", (3.0, 11.0, 1.905), (3.048, 4.572, 1.905), adu, 0.06)
    cube("A600_PROXY_Glazing", "ADU_VOLUME", (3.0, 6.39, 1.72), (1.72, 0.035, 1.32), glass, 0.015)
    cube("A600_PROXY_Roof", "ADU_VOLUME", (3.0, 11.0, 3.94), (3.25, 4.78, 0.14), graph, 0.04)

    path = curve_line("Planning_Path", [(-3.6, -1.7, 0.04), (-3.2, 2.3, 0.04), (-0.6, 5.6, 0.04), (3.0, 6.25, 0.04)], line, 0.055)
    path.scale = (0.001, 0.001, 0.001)
    path.keyframe_insert("scale", frame=20)
    path.scale = (1, 1, 1)
    path.keyframe_insert("scale", frame=44)

    stage_locations = [(-3.6, 0.2, 0.25), (-2.6, 2.8, 0.25), (-0.6, 5.0, 0.25), (1.8, 6.1, 0.25)]
    for idx, pos in enumerate(stage_locations, 1):
        node = cylinder(f"Stage_{idx:02d}", "PROJECT_GRAPH", pos, 0.24, 0.16, graph)
        start = 42 + idx * 6
        node.scale = (0.001, 0.001, 0.001)
        node.keyframe_insert("scale", frame=start)
        node.scale = (1, 1, 1)
        node.keyframe_insert("scale", frame=start + 5)

    interface = cube("KBP_OS_Plane", "OUTPUT_FRAMING", (-3.9, 7.5, 2.25), (2.55, 0.08, 1.62), ui, 0.09)
    interface.location.z = -1.8
    interface.keyframe_insert("location", frame=70)
    interface.location.z = 2.25
    interface.keyframe_insert("location", frame=96)
    interface["role"] = "SECONDARY_AFTER_PHYSICAL_TRUTH"

    sun_data = bpy.data.lights.new("California_Daylight", "SUN")
    sun_data.energy, sun_data.angle = 3.0, math.radians(4.0)
    sun = bpy.data.objects.new("California_Daylight", sun_data)
    collection("LIGHTING").objects.link(sun)
    sun.rotation_euler = (math.radians(38), 0, math.radians(128))
    area_data = bpy.data.lights.new("Interior_Fill", "AREA")
    area_data.energy, area_data.shape, area_data.size = 700, "RECTANGLE", 8
    area = bpy.data.objects.new("Interior_Fill", area_data)
    collection("LIGHTING").objects.link(area)
    area.location = (0, -1.5, 5.8)
    point_camera(area, (2, 8, 1.8))
    bpy.context.scene.world = bpy.data.worlds.new("Neutral_Daylight_World")
    bpy.context.scene.world.use_nodes = True
    bpy.context.scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.31, 0.43, 0.55, 1)
    bpy.context.scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32

    cameras = {}
    specs = {
        "CAM_DESKTOP": ((-7.8, -9.0, 3.15), 34.0, (1.7, 8.6, 1.8)),
        "CAM_TABLET": ((-5.2, -8.0, 3.9), 38.0, (2.1, 8.9, 1.8)),
        "CAM_MOBILE": ((-2.8, -7.2, 3.45), 45.0, (2.8, 9.2, 1.9)),
    }
    for name, (location, lens, target) in specs.items():
        data = bpy.data.cameras.new(name)
        data.lens, data.sensor_width = lens, 36
        camera = bpy.data.objects.new(name, data)
        collection("CAMERA_RIGS").objects.link(camera)
        camera.location = location
        point_camera(camera, target)
        cameras[name] = camera
    desktop = cameras["CAM_DESKTOP"]
    desktop.keyframe_insert("location", frame=1)
    desktop.location += Vector((0.45, 0.55, 0.12))
    desktop.keyframe_insert("location", frame=96)
    # Blender 5.2 stores layered action curves behind channel bags rather than
    # the legacy Action.fcurves collection. The inserted keys intentionally use
    # Blender's deterministic default Bezier interpolation; no legacy curve
    # mutation is attempted here.

    bpy.context.scene.camera = desktop
    bpy.context.scene["work_node"] = "work.product2-hero-blender-camera-motion-recovery-0001"
    bpy.context.scene["proxy_disclosure"] = "ALL ARCHITECTURE IS NEUTRAL PROXY MASSING; NOT FINAL A600"
    bpy.context.scene["cycles_backend"] = backend
    return cameras


def render_stills(out: Path, cameras: dict[str, bpy.types.Object]) -> list[Path]:
    scene = bpy.context.scene
    outputs = []
    specs = (
        ("CAM_DESKTOP", 1440, 900, "desktop-1440x900.png"),
        ("CAM_TABLET", 820, 1180, "tablet-820x1180.png"),
        ("CAM_MOBILE", 390, 844, "mobile-390x844.png"),
    )
    scene.frame_set(70)
    for camera, width, height, filename in specs:
        scene.camera = cameras[camera]
        scene.render.resolution_x, scene.render.resolution_y = width, height
        scene.render.resolution_percentage = 100
        path = out / filename
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True)
        outputs.append(path)
    return outputs


def contact_sheet(out: Path, stills: list[Path]) -> Path:
    target = out / "responsive-contact-sheet.png"
    subprocess.run([
        "magick", str(stills[0]), "-resize", "720x450!",
        str(stills[1]), "-resize", "313x450!", str(stills[2]), "-resize", "208x450!",
        "+append", "-background", "#e8e3d8", "-gravity", "center", "-extent", "1280x520", str(target),
    ], check=True)
    return target


def render_animatic(out: Path, camera: bpy.types.Object) -> Path:
    scene = bpy.context.scene
    scene.camera = camera
    scene.frame_start, scene.frame_end = 71, 96
    scene.render.resolution_x, scene.render.resolution_y = 960, 600
    scene.render.resolution_percentage = 100
    frames = out / "transition-frames"
    frames.mkdir(exist_ok=True)
    scene.render.filepath = str(frames / "frame-")
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(animation=True)
    target = out / "first-transition.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-framerate", "24", "-start_number", "71",
        "-i", str(frames / "frame-%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(target),
    ], check=True)
    return target


def main() -> None:
    args = parse_args()
    out = Path(args.output).resolve()
    out.mkdir(parents=True, exist_ok=True)
    cameras = build_scene(args.samples)
    blend = out / "p2-hero-system.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    outputs: list[Path] = [blend]
    if args.mode in {"stills", "all"}:
        stills = render_stills(out, cameras)
        outputs.extend(stills)
        outputs.append(contact_sheet(out, stills))
    if args.mode in {"animatic", "all"}:
        outputs.append(render_animatic(out, cameras["CAM_DESKTOP"]))
    manifest = {"schema": "p2-hero-artifact-set/1", "seed": SEED, "outputs": [p.name for p in outputs]}
    (out / "artifact-set.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("KBP_P2_HERO_BUILD=PASS")


if __name__ == "__main__":
    main()
