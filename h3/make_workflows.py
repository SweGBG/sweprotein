"""Builds the four SweProtein H3 workflows from Lenn's Minimax_H3_3060_v3 template."""
import copy, json, sys

TEMPLATE = sys.argv[1]
OUT = sys.argv[2]

STYLE = (
    "Live-action, horizontal 16:9 composition, ONE single continuous shot from a completely locked-off static tripod camera, "
    "no cuts, no scene change, no camera movement, no zoom, no pan, no change of lighting. "
    "High-end beverage commercial, ultra slow motion, 1000 fps phantom camera look, crisp macro detail. "
    "Deep berry-black background with a soft magenta-pink glow behind the center, warm pink rim light, glossy highlights, faint drifting mist."
)
SHAKE = "a thick creamy pink strawberry protein shake, smooth and glossy like a milkshake, with tiny bubbles"
BOTTLE = (
    "a tall rounded clear plastic sports bottle filled with the creamy pink strawberry shake, a matte black ribbed screw cap, "
    "a plain milk-white wraparound label with bold black rounded lettering reading \"SWEPROTEIN\""
)

CLIPS = [
    ("SweProtein_01_Hero", "Hjältebär", False,
     f"[Shot 1] {STYLE} A single perfect ripe red strawberry with green leaves stands upright on a glossy black surface in the center of the frame, exactly as in the first frame. "
     "[Shot 2] At 00:02.000, the same static shot: the strawberry slowly lifts off the surface and floats weightless, slowly rotating, tiny water droplets peeling off it and sparkling in the pink rim light. "
     "[Shot 3] At 00:05.000, the same static shot: a glossy creamy pink liquid surface rises from the bottom of the frame and covers the black surface, the floating strawberry hovering just above it."),
    ("SweProtein_02_Fall", "Ingredienserna faller", True,
     f"[Shot 1] {STYLE} The lower third of the frame is the rippling surface of {SHAKE}. The big strawberry plunges into the center of the surface with a crown-shaped splash of pink cream. "
     "[Shot 2] At 00:02.000, the same static shot: more fresh strawberries, squares of dark chocolate, rolled oats and a few blueberries rain down from the top of the frame one after another, "
     "each one hitting the creamy surface with its own slow-motion splash and flying droplets. [Shot 3] At 00:05.500, the same static shot: the creamy pink surface keeps rising and now fills the lower half of the frame, "
     "the last strawberry sinking in, droplets falling back."),
    ("SweProtein_03_Swirl", "Mjölkvirveln", True,
     f"[Shot 1] {STYLE} The frame is half filled with {SHAKE}, rising fast. [Shot 2] At 00:02.000, the same static shot: a ribbon of white milk pours in from the top and twists into a slow spiral swirl "
     "inside the pink shake, creamy white and pink marbling. [Shot 3] At 00:05.000, the same static shot: the swirling pink shake fills almost the whole frame, rich and velvety, "
     "small bubbles rising, the surface calm at the very top edge of the frame."),
    ("SweProtein_04_Bottle", "Flaskan stiger", True,
     f"[Shot 1] {STYLE} The frame is filled with {SHAKE}, its glossy surface slowly sinking down. [Shot 2] At 00:02.000, the same static shot: the black cap of {BOTTLE} breaks up through the surface "
     "in the center of the frame, pink cream sliding off it. [Shot 3] At 00:04.500, the same static shot: the whole bottle rises up and floats upright in the exact center of the frame, "
     "pink drips running down the bottle and the label, the shake surface settling far below. [Shot 4] At 00:06.500, the same static shot: the bottle hangs still in the air with a soft pink glow behind it, "
     "a few droplets drifting, the bottle settling down onto a glossy black surface among fresh strawberries, ending exactly on the last frame."),
]

SOUND = "\n\noverall_soundscape: soft whoosh, thick creamy liquid splashes, gentle bubbling.\n\nnon_diegetic_music: none."

tpl = json.load(open(TEMPLATE, encoding="utf-8"))
nodes0, links0 = len(tpl["nodes"]), len(tpl["links"])
for i, (name, title, chained, prompt) in enumerate(CLIPS, 1):
    wf = copy.deepcopy(tpl)
    by = {n["id"]: n for n in wf["nodes"]}
    by[131]["widgets_values"][0] = "integrated_multimodal_description: " + prompt + SOUND
    by[142]["widgets_values"]["filename_prefix"] = f"video/{name}"
    by[168]["widgets_values"][0] = f"video/{name}_lastframe"
    by[133]["widgets_values"][0] = 8
    by[115]["widgets_values"][:2] = ["16:9 (Widescreen)", 0.5]
    if i == 1:  # clip 1 starts from the real Unsplash strawberry
        by[165]["mode"] = 0
        by[165]["widgets_values"][0] = "sweprotein/sweprotein_h3_start.png"
    else:  # clips 2-4 get the previous clip's last frame when queued
        by[165]["mode"] = 4
        by[165]["widgets_values"][0] = "example.png"
    if i == 4:  # clip 4 lands exactly on the Figma bottle (H3 last_frame)
        nid = max(n["id"] for n in wf["nodes"]) + 1
        lid = max(l[0] for l in wf["links"]) + 1
        end = copy.deepcopy(by[165])
        end.update(id=nid, mode=0, title="Slutbild (flaskan)", pos=[by[165]["pos"][0], by[165]["pos"][1] + 420])
        end["widgets_values"] = ["sweprotein/sweprotein_h3_end.png", "image"]
        end["outputs"][0]["links"] = [lid]
        wf["nodes"].append(end)
        wf["links"].append([lid, nid, 0, 131, 3, "IMAGE"])
        next(x for x in by[131]["inputs"] if x["name"] == "last_frame")["link"] = lid
        wf["last_node_id"], wf["last_link_id"] = nid, lid
    prev = CLIPS[i - 2][0] if i > 1 else None
    by[164]["widgets_values"][0] = (
        f"## SweProtein {i}/4 – {title}\n\nScrollstyrd scenfilm för SweProtein-sajten. 16:9, 0.5 MP (960x544), 8 s, låst kamera.\n"
        + (f"- **Startbild:** sista bildrutan från {prev} (`{prev}_lastframe`). Ctrl+B på Startbild och välj den.\n" if prev
           else "- **Startbild:** jordgubbsfoto från Unsplash (sweprotein_h3_start.png).\n")
        + ("- **Slutbild:** flaskan från Figma (sweprotein_h3_end.png), kopplad till last_frame.\n" if i == 4 else "")
        + "- Ändra inte LoRA, steg, sampler eller crf."
    )
    extra = 1 if i == 4 else 0
    assert len(wf["nodes"]) == nodes0 + extra and len(wf["links"]) == links0 + extra
    path = f"{OUT}/{name}.json"
    json.dump(wf, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(path, len(by[131]["widgets_values"][0]), "chars")
