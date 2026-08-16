#!/usr/bin/env python3
"""Deterministic, rights-clean My Lot Studio master for Issue #333.

Only Blender primitives, generated geometry, procedural materials/world, and
Blender's built-in Bfont are used. Cycles must bind an NVIDIA CUDA/OptiX GPU.
"""
from __future__ import annotations

import argparse, hashlib, math, subprocess, sys
from pathlib import Path
import bpy
from mathutils import Vector

DISCLOSURE = "Conceptual A600 visualization on a representative property — not a completed project, parcel-specific fit, approved plan, permit, price, schedule, or buildability conclusion."
COLS = ("PARCEL","MAIN_HOUSE","A600","PLACEMENTS","LANDSCAPE","CONTEXT","EDITORIAL","LIGHTING","CAMERAS")

def arguments():
    p=argparse.ArgumentParser(); p.add_argument("--output",required=True); p.add_argument("--samples",type=int,default=28)
    return p.parse_args(sys.argv[sys.argv.index("--")+1:])

def col(name): return bpy.data.collections[name]
def link(o,name):
    for c in list(o.users_collection): c.objects.unlink(o)
    col(name).objects.link(o); return o

def material(name, color, rough=.55, metal=0.0, alpha=1.0, noise=.0, bump=.0):
    m=bpy.data.materials.new(name); m.use_nodes=True; m.diffuse_color=(*color,alpha)
    n=m.node_tree.nodes; l=m.node_tree.links; b=n.get("Principled BSDF")
    b.inputs["Base Color"].default_value=(*color,1); b.inputs["Roughness"].default_value=rough; b.inputs["Metallic"].default_value=metal
    if alpha<1: b.inputs["Alpha"].default_value=alpha; m.surface_render_method="DITHERED"
    if noise:
        tex=n.new("ShaderNodeTexNoise"); tex.inputs["Scale"].default_value=noise; tex.inputs["Detail"].default_value=5; tex.inputs["Roughness"].default_value=.72
        ramp=n.new("ShaderNodeValToRGB"); ramp.color_ramp.elements[0].position=.24; ramp.color_ramp.elements[0].color=(*[max(0,c*.72) for c in color],1)
        ramp.color_ramp.elements[1].position=.78; ramp.color_ramp.elements[1].color=(*[min(1,c*1.18) for c in color],1)
        l.new(tex.outputs["Fac"],ramp.inputs["Fac"]); l.new(ramp.outputs["Color"],b.inputs["Base Color"])
        if bump:
            bn=n.new("ShaderNodeBump"); bn.inputs["Strength"].default_value=bump; bn.inputs["Distance"].default_value=.08
            l.new(tex.outputs["Fac"],bn.inputs["Height"]); l.new(bn.outputs["Normal"],b.inputs["Normal"])
    return m

def cube(name,collection,loc,scale,mat,bevel=.05):
    bpy.ops.mesh.primitive_cube_add(location=loc); o=bpy.context.object; o.name=name; o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(mat); link(o,collection)
    if bevel: mod=o.modifiers.new("architectural edge","BEVEL"); mod.width=bevel; mod.segments=3
    o["source_class"]="PACKET_PROCEDURAL_GEOMETRY"; return o

def cylinder(name,collection,loc,radius,depth,mat,vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc); o=bpy.context.object; o.name=name; o.data.materials.append(mat); link(o,collection); o["source_class"]="PACKET_PROCEDURAL_GEOMETRY"; return o

def curve(name,points,mat,width=.035,collection="CONTEXT"):
    d=bpy.data.curves.new(name,"CURVE"); d.dimensions="3D"; d.bevel_depth=width; d.bevel_resolution=3
    s=d.splines.new("POLY"); s.points.add(len(points)-1)
    for p,co in zip(s.points,points): p.co=(*co,1)
    o=bpy.data.objects.new(name,d); d.materials.append(mat); col(collection).objects.link(o); o["source_class"]="DERIVED_TECHNICAL"; return o

def text(name,body,loc,size,mat,extrude=.006):
    d=bpy.data.curves.new(name,"FONT"); d.body=body; d.size=size; d.extrude=extrude; d.align_x="LEFT"; d.materials.append(mat)
    o=bpy.data.objects.new(name,d); col("EDITORIAL").objects.link(o); o.location=loc; o.rotation_euler=(math.radians(90),0,0); o["source_class"]="BLENDER_BUILTIN_BFONT"; return o

def point(o,target): o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
def key(o,frame,prop="scale"): o.keyframe_insert(prop,frame=frame)

def setup(samples):
    bpy.ops.wm.read_factory_settings(use_empty=True); s=bpy.context.scene
    for n in COLS: s.collection.children.link(bpy.data.collections.new(n))
    s.unit_settings.system="METRIC"; s.render.engine="CYCLES"; s.cycles.device="GPU"; s.cycles.samples=samples; s.cycles.use_denoising=True
    s.render.image_settings.file_format="PNG"; s.render.image_settings.color_mode="RGB"; s.render.fps=60; s.render.fps_base=1; s.frame_start=1; s.frame_end=241
    s.view_settings.look="AgX - Medium High Contrast"
    p=bpy.context.preferences.addons["cycles"].preferences; selected=None
    for backend in ("OPTIX","CUDA"):
        try:
            p.compute_device_type=backend; p.get_devices(); g=[d for d in p.devices if d.type==backend and "NVIDIA" in d.name]
            if g:
                for d in p.devices: d.use=d in g
                selected=backend; break
        except Exception: pass
    if selected not in {"OPTIX","CUDA"} or s.cycles.device!="GPU": raise RuntimeError("CPU_FALLBACK_REFUSED")
    print("KBP_CYCLES_BACKEND="+selected); print("KBP_SCENE_DEVICE=GPU")
    for d in p.devices:
        if d.use: print("KBP_CYCLES_DEVICE="+d.type+":"+d.name)
    return s

def roof(name,collection,x,y,z,w,d,mat):
    for side,rot in ((-1,-18.435),(1,18.435)):
        o=cube(f"{name}_{side}",collection,(x+side*w*.25,y,z),(w*.29,d,.13),mat,.025); o.rotation_euler[1]=math.radians(rot)

def tree(name,x,y,scale,trunk,leaf):
    cylinder(name+"_trunk","LANDSCAPE",(x,y,scale*1.65),scale*.16,scale*3.3,trunk,64)
    for i,(dx,dy,dz,r) in enumerate(((0,0,3.5,1.05),(.6,.15,3.25,.76),(-.55,.12,3.2,.8),(.15,-.55,3.1,.72),(0,.42,3.75,.62))):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4,radius=scale*r,location=(x+dx*scale,y+dy*scale,dz*scale)); o=bpy.context.object; o.name=f"{name}_canopy_{i}"; o.scale.z=.82; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(leaf); link(o,"LANDSCAPE")

def build(out,samples):
    s=setup(samples)
    white=material("Architectural white #F4F0E8",(.905,.871,.807),.72,noise=18,bump=.12); charcoal=material("Near-black charcoal #1C1B18",(.012,.011,.009),.38,noise=42,bump=.08)
    mineral=material("Mineral gray #8C8982",(.263,.25,.224),.78,noise=24,bump=.18); copper=material("Oxidized copper #A65F32",(.381,.114,.032),.56,noise=32,bump=.14)
    lawn=material("Drought landscape",(.115,.20,.075),.9,noise=10,bump=.22); leaf=material("California olive foliage",(.075,.15,.055),.88,noise=15,bump=.15); wood=material("Natural wood",(.22,.095,.03),.64,noise=7,bump=.2)
    glass=material("Low-e glazing",(.035,.075,.085),.17,metal=.06,alpha=.48); ghost=material("Preliminary placement",(.33,.55,.43),.32,alpha=.23); line=material("Public context copper",(.46,.14,.045),.4); unknown=material("Unknown zone",(.34,.33,.30),.82,alpha=.52)
    # Parcel is the interface; 18.3 x 36.6 m representative lot.
    cube("Representative parcel","PARCEL",(0,3,-.16),(9.15,18.3,.16),lawn,.06)
    cube("Driveway","PARCEL",(-5.7,-4.2,.03),(2.3,8.0,.07),mineral,.035); cube("Patio","PARCEL",(2.7,5.3,.035),(3.9,2.0,.075),mineral,.04)
    cube("Neighborhood ground","CONTEXT",(0,4,-.55),(42,45,.35),lawn,.12)
    for i,(x,y,r) in enumerate(((-18,-8,-8),(17,-7,10),(-18,12,5),(18,14,-7),(-10,28,3),(12,29,-4))):
        cube(f"Context house {i+1}","CONTEXT",(x,y,1.65),(5.6,4.1,1.65),mineral,.12)
        roof(f"Context roof {i+1}","CONTEXT",x,y,3.62,11.2,4.25,charcoal)
    # Existing house is deliberately and visibly larger than exact A600.
    cube("Existing main house","MAIN_HOUSE",(0,-7,2.45),(7.25,5.15,2.45),white,.12); roof("Main roof","MAIN_HOUSE",0,-7,5.15,14.5,5.35,charcoal)
    for x in (-4.4,0,4.4): cube("Main glazing "+str(x),"MAIN_HOUSE",(x,-12.18,2.25),(1.35,.05,1.35),glass,.025)
    # Exact 20x30 ft A600: 6.096 x 9.144 m, 9 ft plate, 4:12 gable.
    adu=cube("A600 exact owned envelope","A600",(2.7,10.5,1.3716),(3.048,4.572,1.3716),white,.09); adu["owned_geometry"]="20x30 ft; 9 ft plate; 4:12 roof"
    roof("A600 roof","A600",2.7,10.5,3.12,6.096,4.72,charcoal)
    cube("A600 glazing","A600",(2.7,5.91,1.48),(1.72,.045,1.12),glass,.02)
    for i in range(13): cube(f"A600 siding rhythm {i:02d}","A600",(-.18+i*.48,5.855,1.46),(.016,.025,1.18),copper,.004)
    # Two refined placement volumes.
    ghosts=[]
    for i,(x,y,r) in enumerate(((-3.6,9.0,-8),(4.8,1.5,15)),1):
        o=cube(f"Preliminary A600 placement {i}","PLACEMENTS",(x,y,1.2),(3.048,4.572,1.2),ghost,.08); o.rotation_euler[2]=math.radians(r); ghosts.append(o)
    # Thin parcel line and uncertainty zones, never survey/buildability claims.
    boundary=[(-8.8,-14.8,.08),(8.8,-14.8,.08),(8.8,20.8,.08),(-8.8,20.8,.08),(-8.8,-14.8,.08)]
    parcel_line=curve("Public parcel context",boundary,line,.045); parcel_line.data.bevel_factor_end=0; parcel_line.data.keyframe_insert("bevel_factor_end",frame=72); parcel_line.data.bevel_factor_end=1; parcel_line.data.keyframe_insert("bevel_factor_end",frame=116)
    for i,(x,y,w,d) in enumerate(((-6.8,13.2,1.25,3.0),(6.8,15.0,1.0,2.2))): cube(f"Unknown zone {i+1}","CONTEXT",(x,y,.11),(w,d,.08),unknown,.25)
    curve("Preliminary fit zone",[(-1,5.2,.11),(6.3,5.2,.11),(6.3,15.3,.11),(-1,15.3,.11),(-1,5.2,.11)],line,.065)
    # Mature procedural planting without low-poly visible silhouettes.
    tree("Valley oak",-6.9,7.8,1.42,wood,leaf); tree("Olive",7.0,12.8,1.05,wood,leaf)
    for i,(x,y,r) in enumerate(((-5,2,.55),(-6,4,.42),(6,6,.48),(7,8,.38),(-4,15,.5))):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=r,location=(x,y,r*.62)); o=bpy.context.object; o.name=f"Drought planting {i+1}"; o.scale.z=.62; o.data.materials.append(leaf); link(o,"LANDSCAPE")
    # Warm-white editorial composition integrated beside the scene.
    cube("Editorial warm-white field","EDITORIAL",(-13.2,3,3.2),(4.7,9.8,.08),white,.12)
    text("Hero title","Your lot.\nYour possibilities.",(-16.5,3.0,6.3),.72,charcoal)
    text("Address prompt","Enter your property address",(-16.5,3.0,3.55),.28,mineral)
    cube("Address rule","EDITORIAL",(-13.2,2.98,3.16),(3.3,.035,.035),mineral,.02)
    text("Reveal CTA","Reveal my lot",(-16.5,3.0,2.35),.3,white)
    cube("Reveal button","EDITORIAL",(-14.75,3.04,2.4),(1.8,.08,.43),charcoal,.16)
    text("Public label","Public parcel context",(-16.5,3.0,1.15),.17,copper)
    text("Preliminary label","Preliminary",(-16.5,3.0,.68),.16,mineral)
    text("Unknown label","Unknown",(-13.8,3.0,.68),.16,mineral)
    text("Fit label","Preliminary fit zone",(-11.8,3.0,.68),.16,copper)
    # Lighting and atmospheric depth.
    world=bpy.data.worlds.new("California daylight world"); world.use_nodes=True; wn=world.node_tree.nodes; wl=world.node_tree.links; bg=wn["Background"]; sky=wn.new("ShaderNodeTexSky"); sky.sky_type="MULTIPLE_SCATTERING"; sky.sun_elevation=math.radians(34); sky.sun_rotation=math.radians(128); sky.altitude=.08; sky.air_density=.82; bg.inputs["Strength"].default_value=.42; wl.new(sky.outputs["Color"],bg.inputs["Color"]); s.world=world
    ld=bpy.data.lights.new("California sun","SUN"); ld.energy=3.5; ld.angle=math.radians(6); sun=bpy.data.objects.new("California sun",ld); col("LIGHTING").objects.link(sun); sun.rotation_euler=(math.radians(36),0,math.radians(128))
    ad=bpy.data.lights.new("Editorial softbox","AREA"); ad.energy=900; ad.shape="DISK"; ad.size=10; area=bpy.data.objects.new("Editorial softbox",ad); col("LIGHTING").objects.link(area); area.location=(-8,-3,13); point(area,(0,5,0))
    # Dedicated responsive cameras.
    cams={}
    for name,loc,lens,target in (("DESKTOP",(-24,-34,20),52,(0,4,1.5)),("TABLET",(-17,-37,24),56,(0,5,1.8)),("MOBILE",(-11,-41,25),60,(1,5,1.9))):
        d=bpy.data.cameras.new(name); d.lens=lens; o=bpy.data.objects.new(name,d); col("CAMERAS").objects.link(o); o.location=loc; point(o,target); cams[name]=o
    # Continuous 4 s motion: altitude descent, clockwise context, resolve, rise/materialize, eye-level finish.
    cam=cams["DESKTOP"]; cam.location=(-5,-52,62); point(cam,(0,3,0)); key(cam,1,"location"); key(cam,1,"rotation_euler")
    cam.location=(-20,-36,34); point(cam,(0,3,1)); key(cam,72,"location"); key(cam,72,"rotation_euler")
    cam.location=(-24,-34,20); point(cam,(0,4,1.5)); key(cam,241,"location"); key(cam,241,"rotation_euler")
    for o in ghosts:
        z=o.location.z; o.location.z=-1.5; key(o,116,"location"); o.location.z=z; key(o,164,"location")
    # Selected A600 materializes from translucent to credible material.
    adu.scale=(.001,.001,.001); key(adu,144); adu.scale=(1,1,1); key(adu,194)
    # Blender 5.2 stores layered curves behind action slots; inserted keys use
    # deterministic Bezier interpolation by default, so no legacy traversal.
    s["visual_master"]="P2-MY-LOT-STUDIO-VISUAL-MASTER-0001"; s["worker_issue"]=333; s["production_use"]="REFUSED"; s["publication_disclosure"]=DISCLOSURE; s["external_dependencies"]="NONE"; s.camera=cam
    bpy.ops.wm.save_as_mainfile(filepath=str(out/"p2-my-lot-studio-master.blend"))
    return s,cams

def render(out,s,cams):
    s.frame_set(241); paths=[]
    for cam,w,h,name in (("DESKTOP",1440,1024,"desktop-1440x1024.png"),("TABLET",820,1180,"tablet-820x1180.png"),("MOBILE",390,844,"mobile-390x844.png")):
        s.camera=cams[cam]; s.render.resolution_x=w; s.render.resolution_y=h; s.render.resolution_percentage=100; s.render.filepath=str(out/name); bpy.ops.render.render(write_still=True); paths.append(out/name)
    frames=out/"transition-frames"; frames.mkdir(exist_ok=True); s.camera=cams["DESKTOP"]; s.render.resolution_x=960; s.render.resolution_y=540; s.render.resolution_percentage=100; s.render.filepath=str(frames/"frame-"); s.frame_start=1; s.frame_end=241; bpy.ops.render.render(animation=True)
    movie=out/"first-transition-60fps.mp4"; subprocess.run(["ffmpeg","-y","-framerate","60","-start_number","1","-i",str(frames/"frame-%04d.png"),"-c:v","libx264","-crf","18","-pix_fmt","yuv420p","-movflags","+faststart",str(movie)],check=True)
    return paths,movie

def main():
    a=arguments(); out=Path(a.output).resolve(); out.mkdir(parents=True,exist_ok=True); s,c=build(out,a.samples); stills,movie=render(out,s,c)
    print("KBP_MY_LOT_STUDIO_MASTER=PASS"); print("KBP_DISCLOSURE="+DISCLOSURE)
    for p in [out/"p2-my-lot-studio-master.blend",*stills,movie]: print("KBP_ARTIFACT="+p.name+":"+hashlib.sha256(p.read_bytes()).hexdigest())
if __name__=="__main__": main()
