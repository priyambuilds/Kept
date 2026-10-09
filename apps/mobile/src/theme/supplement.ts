// UI values used by the prototype that design/tokens.json doesn't name. Each one cites where it comes
// from (components.md or the renderer in reference/KEPT Play.dc.html). Keep this list short; anything
// added here should also be proposed for tokens.json.
export const supplement = {
  color: {
    /** Button disabled label (components.md › Button › States). */
    disabledFg: "#5A5A5A",
    /** Toggle knob when off (components.md › Toggle). */
    toggleKnobOff: "#9A9A9A",
    /** Unselected option / tab bar / search ring: white .07 (OptionGrid, TabBar, SearchBar). */
    hairline07: "rgba(255,255,255,0.07)",
    /** Avatar row-tile / seat highlight and shade (RowList leading tile, SeatSlots). */
    tileHi22: "rgba(255,255,255,0.22)",
    tileHi35: "rgba(255,255,255,0.35)",
    tileHi45: "rgba(255,255,255,0.45)",
    tileShade15: "rgba(0,0,0,0.15)",
    tileShade20: "rgba(0,0,0,0.20)",
    /** Grid legend swatches (renderer › grid legend). */
    legendPending: "#4A4A4A",
    legendReview: "rgba(167,139,250,0.5)",
    /** Grid "photo 1 done" cell ring (renderer CELL.h). */
    halfRing: "rgba(197,242,92,0.5)",
    /** Upload box ring (components.md › UploadBox). */
    uploadRing: "#333333",
    uploadHatchA: "#171717",
    uploadHatchB: "#1A1A1A",
    /** Camera pill backgrounds (components.md › ProofCamera). */
    camPill: "rgba(0,0,0,0.6)",
    camPillCheck: "rgba(0,0,0,0.65)",
    camPhotoPill: "rgba(255,255,255,0.12)",
    camCornerIdle: "rgba(255,255,255,0.65)",
    camObject: "rgba(255,255,255,0.42)",
    camGradient: ["#2A2A2E", "#0A0A0B"],
    /** Cover / hero decoration (BountyCover, HScroller, ProfileCard banner icon). */
    onCover28: "rgba(0,0,0,0.28)",
    decoWhite16: "rgba(255,255,255,0.16)",
    decoWhite20: "rgba(255,255,255,0.20)",
    /** Decor icons behind content (DESIGN.md §2.9). */
    decor: "#1E1E1E",
    /** Keeper floor shadow (components.md › KeeperPlacement). */
    keeperShadow: "rgba(0,0,0,0.6)",
    /** KeeperNote tile: radial #2A2A30 → #131313 (tokens.material.keeperNoteTile). */
    keeperNoteTile: ["#2A2A30", "#131313"],
    /** Swatch ring when unselected (AvatarBuilder). */
    swatchRing: "rgba(255,255,255,0.15)",
    /** Sheet grabber (components.md › BottomSheet). */
    grabber: "rgba(255,255,255,0.25)",
    /** Skeleton block (screens.md › States › loading). */
    skeleton: "#1C1C1C",
    /** Card sheen end / transparent. */
    transparent: "transparent",
  },
} as const;
