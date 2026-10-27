# Homepage direction

Surface: /. Visitor mode: Experience. Primary viewing contexts: phone portrait and portrait iPad.

## Direction contract

THESIS: Vincent's photographs and films form a floating, overlapping deck. Visitors enter the work immediately, select a piece, and open it into a clear individual view.

OWN-WORLD: An uninterrupted near-black field, the real media's own colors, small rounded image corners and quiet locally hosted DIN Pro. A shared three-dimensional assembly creates depth through occlusion and shallow yaw. The camera stays steady.

STORY: Browse the mixed deck, inspect a work, then reach the existing statistics, biography and contact details. Sticky Work/About/Contact navigation provides immediate exits. Flat view offers the complete collection in normal document flow.

FIRST VIEWPORT: A compact identity/navigation line and understated Selected work toolbar surround a large centered media deck. The user's final scale correction explicitly permits peripheral cards to bleed past phone edges. The active piece stays centered and fully visible, while the title, count and 44px controls remain inside the safe area. Phone and portrait iPad composition lead. The 29 photographs and films shuffle once per load, with that order retained between views.

FORM: VIDEO-01, the user-selected `docs/sample/Video Project 27.mp4`, replaces the earlier image references as the primary appearance and motion evidence. All 215 frames were extracted and reviewed; `docs/reference-video-analysis.md` separates visible evidence from implementation interpretation. The user's subsequent requests add subtle continuous up/down and back/forth floating and prioritize phone/portrait iPad. This is the code-led pinned-reference path in Impeccable Experience mode.

FINISH: Production captures, tests, a fresh finish review and sequential design documentation are the completion evidence. The pre-change working tree remains recoverable at `D:/projects/vincent-guanco-baseline-20261027-astra`. Catalog, provenance and all 58 delivered media files retain their original bytes.

## Interaction

Native document scrolling selects works through a sticky stage. Horizontal drag, Previous/Next, arrows and Home/End share the same selected index and document position. Vertical touch remains native. Enter or View work gathers surrounding cards and enlarges the selected piece to fit the stage; Escape or Back to stack restores the cloud. Focus deliberately adapts the reference's small single-card hold so the actual work remains usable.

The parallel rounded cards overlap in a compact volume. Shared idle yaw, vertical travel, restrained lateral sway and forward/back depth travel move the whole deck. This floating interpretation was explicitly requested after frame analysis; exact source transforms cannot be recovered from the recording. A fixed camera avoids a bobbing viewpoint. The idle clock stops while pressing/dragging, paused, focused, hidden or offscreen. Focus transitions ease the assembly to center. Selection transitions briefly gather and turn the deck, then restore its spread.

Motion pause is independent of film pause. Reduced motion retains the gallery, removes idle movement and makes selection/focus immediate. A live operating-system preference change updates the existing scene without destroying its WebGL context. The interactive Chrome review profile had reduced motion enabled; explicit no-preference contexts provide motion evidence.

Selected films autoplay muted, looping and playsInline on their actual Three.js planes. Flat films autoplay while visible. Custom Play, Space and Retry call the video element synchronously from the user event through an imperative controller bridge, preserving mobile gesture permission. There are no media dialogs or native video control bars.

## Responsive and resource policy

The gallery uses dynamic viewport height and safe-area insets. The caption becomes two rows on phones, while portrait tablets retain a readable single-row caption. All visible gallery and navigation controls are at least 44px in the tested primary layouts. The final user correction brings base framing 20% closer, producing roughly 25–30% larger projection, with a conservative active-media fit through float/yaw extremes. Rotation pivots around the front plane so it stays centered. Surrounding cards may clip at the stage edge; no horizontal document scroll is introduced. The inspected piece retains its complete natural aspect ratio.

The later centering correction balances the projected surrounding cards around that front anchor. This removes the rear planes' leftward bias during yaw without retreating the camera, reducing image sizes or moving the settled active plane. Selection weights remain continuous; reduced motion also uses the balanced resting composition. Current evidence is in `docs/reference-gallery-centering.md`.

The lazy-loaded renderer holds at most nine previews at widths through 1024px and thirteen on wider screens, with at most one film decoder. Displaced textures and video sources are disposed. Useful rendering is bounded to 30fps, pixel ratio is capped at 1.5, and offscreen/hidden rendering and playback suspend. Flat films clear their source when hidden or offscreen. A lost WebGL context or failed spatial preview exposes the complete Flat archive.

Exact statistics and contact destinations render independently of media availability. The existing remote ABOUT_ME portraits stream under a complete biography/contact fallback. Existing API and R2 behavior remain compatible.

## Reference correspondence

VIDEO-01 supplies the black field, dense rounded parallel planes, shared depth turn and gather/isolated-hold/release rhythm. The registration marks, meter, play icon and ALL PURPOSE / ASPECT TEST lettering are incidental presentation treatment and are omitted. Full supplied colors and Vincent's DIN Pro identity replace the source's unrelated imagery and lettering. The old oversized WORK / ARCHIVE, floor grid and sharp focus brackets are retired.

INCUMBENT-01 is the preserved starting working tree on `redesign/spatial-archive`, forked from `main`; it supplies content and functional constraints, not the new appearance target. Descriptive work labels do not create new client credits or dates. No deployment, remote cleanup or encoded-media changes are part of this local task.
