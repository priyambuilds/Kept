// GENERATED from design/tokens.json by scripts/gen-theme.js. Do not edit by hand.
/* eslint-disable */
export const tokens = {
  "$meta": {
    "name": "KEPT",
    "version": "1.0.0",
    "units": "dp (1 CSS px in the prototype = 1 dp)",
    "baseFrame": {
      "width": 390,
      "height": 844
    },
    "source": "reference/KEPT Play.dc.html"
  },
  "color": {
    "bg": {
      "app": "#131313",
      "outer": "#0B0B0C",
      "lock": [
        "#1E1E26",
        "#0B0B0E"
      ]
    },
    "surface": {
      "1": "#1C1C1C",
      "2": "#222222",
      "3": "#262626",
      "4": "#2A2A2A",
      "sunken": "#161616",
      "cardTop": "#272727",
      "cardBottom": "#1D1D1D",
      "sheet": "#1C1C1C",
      "stack1": "#1D1D1D",
      "stack2": "#1A1A1A"
    },
    "line": {
      "hairline": "rgba(255,255,255,0.05)",
      "hairline2": "rgba(255,255,255,0.06)",
      "hairline3": "rgba(255,255,255,0.08)",
      "strong": "rgba(255,255,255,0.10)",
      "empty": "#2E2E2E",
      "emptyDark": "#262626",
      "toggleOff": "#3A3A3A"
    },
    "text": {
      "primary": "#FFFFFF",
      "paper": "#F2F0EA",
      "soft": "#D4D4D4",
      "muted": "#BDBDBD",
      "secondary": "#8A8A8A",
      "tertiary": "#6A6A6A",
      "quaternary": "#4A4A4A",
      "ghost": "#3A3A3A",
      "onLime": "#131313",
      "onLimeDeep": "#1A2600"
    },
    "lime": {
      "base": "#C5F25C",
      "hi": "#DAFF80",
      "lo": "#B4E53F",
      "lo2": "#B0E03C",
      "deep": "#8FB52E",
      "shadow": "#5E7A14",
      "edge": "#7FA02A",
      "tint07": "rgba(197,242,92,0.07)",
      "tint10": "rgba(197,242,92,0.10)",
      "tint14": "rgba(197,242,92,0.14)",
      "tint20": "rgba(197,242,92,0.20)",
      "ring45": "rgba(197,242,92,0.45)",
      "glow22": "rgba(197,242,92,0.22)"
    },
    "red": {
      "base": "#F87171",
      "tint12": "rgba(248,113,113,0.12)",
      "tint14": "rgba(248,113,113,0.14)",
      "tint16": "rgba(248,113,113,0.16)",
      "tint22": "rgba(248,113,113,0.22)"
    },
    "orange": {
      "base": "#FB923C",
      "tint13": "rgba(251,146,60,0.13)",
      "tint16": "rgba(251,146,60,0.16)",
      "tint25": "rgba(251,146,60,0.25)",
      "soft": "#FDBA74"
    },
    "violet": {
      "base": "#A78BFA",
      "tint13": "rgba(167,139,250,0.13)",
      "tint16": "rgba(167,139,250,0.16)",
      "tint20": "rgba(167,139,250,0.20)",
      "tint25": "rgba(167,139,250,0.25)"
    },
    "sky": {
      "base": "#38BDF8"
    },
    "member": {
      "you": "#C5F25C",
      "riya": "#F9A8D4",
      "arjun": "#FDE68A",
      "dev": "#93C5FD"
    },
    "tilePalette": {
      "lime": [
        "#E6FF9E",
        "#A9D83C",
        "#1A2600"
      ],
      "vio": [
        "#DCD2FF",
        "#8E70F7",
        "#160B3A"
      ],
      "sky": [
        "#C4E8FF",
        "#3AA3F2",
        "#03213A"
      ],
      "pink": [
        "#FFD3EA",
        "#EF6BB0",
        "#3A0A22"
      ],
      "amber": [
        "#FFE8A8",
        "#F2B232",
        "#3A2400"
      ],
      "orange": [
        "#FFD1AE",
        "#F98A3C",
        "#3A1600"
      ],
      "white": [
        "#FFFFFF",
        "#D6D6D6",
        "#131313"
      ],
      "red": [
        "#FFC9C9",
        "#F06262",
        "#3A0808"
      ],
      "$doc": "[gradientStart, gradientEnd, ink]. Gradient angle 150deg. Used for object/icon tiles."
    },
    "objectTile": {
      "dumbbell": "lime",
      "book-open-variant": "vio",
      "bottle-soda-outline": "sky",
      "guitar-acoustic": "amber",
      "shoe-sneaker": "pink",
      "sprout": "lime",
      "jump-rope": "pink",
      "yoga": "vio",
      "sword-cross": "orange",
      "trophy-outline": "lime",
      "sack": "lime"
    },
    "heroCardPalette": {
      "lime": [
        "#C5F25C",
        "#86B02A",
        "#1A2600"
      ],
      "vio": [
        "#8E70F7",
        "#3B1F8F",
        "#FFFFFF"
      ],
      "sky": [
        "#3AA3F2",
        "#0B4E8C",
        "#FFFFFF"
      ],
      "pink": [
        "#EF6BB0",
        "#8C1D5A",
        "#FFFFFF"
      ],
      "amber": [
        "#F2B232",
        "#8A5A08",
        "#1F1300"
      ],
      "orange": [
        "#F98A3C",
        "#8A3A0A",
        "#FFFFFF"
      ],
      "$doc": "Horizontal scroller cards (Bounty highlights). Gradient 155deg."
    },
    "hp": {
      "full": "gradient: rgb(94,234,212) at segment 0 → rgb(197,242,92) at segment 19 (interpolate per segment)",
      "warn": "#FB923C",
      "danger": "#F87171",
      "emptyOnCard": "#2E2E2E",
      "emptyOnPanel": "#262626",
      "thresholds": {
        "warnAtOrBelow": 40,
        "dangerAtOrBelow": 20
      }
    },
    "gridCell": {
      "kept": {
        "bg": "#C5F25C",
        "fg": "#131313",
        "icon": "check-bold"
      },
      "missed": {
        "bg": "rgba(248,113,113,0.16)",
        "fg": "#F87171",
        "icon": "close-thick",
        "ring": "inset 1.5 #F87171"
      },
      "pending": {
        "bg": "transparent",
        "fg": "#8A8A8A",
        "icon": "timer-sand",
        "ring": "inset 1.5 #3A3A3A"
      },
      "half": {
        "bg": "rgba(197,242,92,0.14)",
        "fg": "#C5F25C",
        "icon": "circle-half-full",
        "ring": "inset 1.5 rgba(197,242,92,0.5)"
      },
      "review": {
        "bg": "rgba(167,139,250,0.20)",
        "fg": "#A78BFA",
        "icon": "eye-outline"
      },
      "future": {
        "bg": "#232323",
        "fg": "transparent",
        "icon": null
      },
      "broke": {
        "bg": "#F87171",
        "fg": "#131313",
        "icon": "fire"
      }
    },
    "keeperGlow": {
      "happy": "rgba(197,242,92,0.22)",
      "shades": "rgba(197,242,92,0.24)",
      "wink": "rgba(197,242,92,0.16)",
      "smug": "rgba(167,139,250,0.22)",
      "stern": "rgba(248,113,113,0.22)",
      "soft": "rgba(167,139,250,0.18)",
      "bored": "rgba(148,163,184,0.14)",
      "side": "rgba(244,114,182,0.16)",
      "shocked": "rgba(251,146,60,0.20)",
      "neutral": "rgba(56,189,248,0.16)"
    },
    "ambient": {
      "lime": [
        "rgba(197,242,92,0.20)",
        "rgba(94,234,212,0.12)"
      ],
      "red": [
        "rgba(248,113,113,0.22)",
        "rgba(251,146,60,0.12)"
      ],
      "ember": [
        "rgba(251,146,60,0.22)",
        "rgba(248,113,113,0.14)"
      ],
      "vio": [
        "rgba(167,139,250,0.18)",
        "rgba(244,114,182,0.10)"
      ],
      "sky": [
        "rgba(56,189,248,0.16)",
        "rgba(167,139,250,0.10)"
      ],
      "defaultByGroup": {
        "A": "lime",
        "C": "vio",
        "K": "vio",
        "H": "sky",
        "E": "sky"
      }
    },
    "toneWash": {
      "lime": "radial(ellipse at 50% 0%, rgba(197,242,92,0.14) → transparent 60%)",
      "red": "radial(ellipse at 50% 0%, rgba(248,113,113,0.17) → transparent 62%)",
      "ember": "radial(ellipse at 50% 100%, rgba(251,146,60,0.18) → transparent 60%) over #151010",
      "grey": "rgba(0,0,0,0.30) overlay",
      "lock": "linear 180deg #1E1E26 → #0B0B0E"
    },
    "banner": {
      "0": [
        "#C5F25C",
        "#38BDF8"
      ],
      "1": [
        "#A78BFA",
        "#F472B6"
      ],
      "2": [
        "#FB923C",
        "#FDE68A"
      ],
      "3": [
        "#38BDF8",
        "#1E3A8A"
      ],
      "4": [
        "#3A3A3A",
        "#141414"
      ],
      "$doc": "Profile banners, linear 135deg"
    },
    "chipTone": {
      "lime": {
        "bg": "rgba(197,242,92,0.14)",
        "fg": "#C5F25C"
      },
      "red": {
        "bg": "rgba(248,113,113,0.14)",
        "fg": "#F87171"
      },
      "vio": {
        "bg": "rgba(167,139,250,0.16)",
        "fg": "#A78BFA"
      },
      "ora": {
        "bg": "rgba(251,146,60,0.16)",
        "fg": "#FB923C"
      },
      "grey": {
        "bg": "#2A2A2A",
        "fg": "#BDBDBD"
      },
      "g": {
        "bg": "#2A2A2A",
        "fg": "#D4D4D4"
      },
      "dark": {
        "bg": "#2A2A2A",
        "fg": "#FFFFFF",
        "ring": "inset 1 rgba(255,255,255,0.10)"
      },
      "white": {
        "bg": "#FFFFFF",
        "fg": "#131313",
        "shadow": "0 8 20 rgba(0,0,0,0.40)"
      }
    },
    "bannerTone": {
      "lime": [
        "rgba(197,242,92,0.10)",
        "rgba(197,242,92,0.20)"
      ],
      "red": [
        "rgba(248,113,113,0.12)",
        "rgba(248,113,113,0.22)"
      ],
      "vio": [
        "rgba(167,139,250,0.13)",
        "rgba(167,139,250,0.25)"
      ],
      "ora": [
        "rgba(251,146,60,0.13)",
        "rgba(251,146,60,0.25)"
      ],
      "grey": [
        "#1C1C1C",
        "#2A2A2A"
      ],
      "$doc": "[background, iconTileBackground]"
    },
    "devnetBadge": {
      "bg": "rgba(251,146,60,0.16)",
      "fg": "#FB923C"
    },
    "scrim": "rgba(0,0,0,0.62)"
  },
  "font": {
    "family": {
      "sans": "Geist",
      "mono": "Geist Mono"
    },
    "expoPackages": {
      "sans": "@expo-google-fonts/geist (Geist_400Regular, Geist_500Medium, Geist_600SemiBold, Geist_700Bold, Geist_800ExtraBold, Geist_900Black)",
      "mono": "@expo-google-fonts/geist-mono (GeistMono_500Medium, GeistMono_600SemiBold)"
    },
    "weights": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "extrabold": 800,
      "black": 900
    }
  },
  "type": {
    "display": {
      "family": "sans",
      "size": 56,
      "lineHeight": 56,
      "weight": 700,
      "letterSpacing": -2.5,
      "tabular": true
    },
    "displayLg": {
      "family": "sans",
      "size": 72,
      "lineHeight": 72,
      "weight": 700,
      "letterSpacing": -2.5,
      "tabular": true
    },
    "lockClock": {
      "family": "sans",
      "size": 84,
      "lineHeight": 92,
      "weight": 600,
      "letterSpacing": -4
    },
    "titleXl": {
      "family": "sans",
      "size": 40,
      "lineHeight": 44,
      "weight": 600,
      "letterSpacing": -1.8
    },
    "title": {
      "family": "sans",
      "size": 30,
      "lineHeight": 33,
      "weight": 600,
      "letterSpacing": -1.1
    },
    "titleSm": {
      "family": "sans",
      "size": 26,
      "lineHeight": 29,
      "weight": 600,
      "letterSpacing": -1.1
    },
    "headerTitle": {
      "family": "sans",
      "size": 28,
      "lineHeight": 34,
      "weight": 700,
      "letterSpacing": -1
    },
    "hpNumber": {
      "family": "sans",
      "size": 36,
      "lineHeight": 40,
      "weight": 700,
      "letterSpacing": -1.5
    },
    "ringValue": {
      "family": "sans",
      "size": 32,
      "lineHeight": 36,
      "weight": 700,
      "letterSpacing": -1.5
    },
    "coverMsg": {
      "family": "sans",
      "size": 22,
      "lineHeight": 26,
      "weight": 700,
      "letterSpacing": -0.7
    },
    "profileName": {
      "family": "sans",
      "size": 22,
      "lineHeight": 28,
      "weight": 700,
      "letterSpacing": -0.7
    },
    "heroCardValue": {
      "family": "sans",
      "size": 19,
      "lineHeight": 24,
      "weight": 700,
      "letterSpacing": -0.6
    },
    "cardName": {
      "family": "sans",
      "size": 17,
      "lineHeight": 22,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "cardLine": {
      "family": "sans",
      "size": 16,
      "lineHeight": 22,
      "weight": 500,
      "letterSpacing": -0.2
    },
    "button": {
      "family": "sans",
      "size": 16,
      "lineHeight": 20,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "buttonSm": {
      "family": "sans",
      "size": 15,
      "lineHeight": 20,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "body": {
      "family": "sans",
      "size": 15,
      "lineHeight": 22,
      "weight": 400,
      "letterSpacing": -0.2,
      "color": "text.secondary"
    },
    "rowTitle": {
      "family": "sans",
      "size": 15,
      "lineHeight": 20,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "keeperLine": {
      "family": "sans",
      "size": 14,
      "lineHeight": 18,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "keeperNote": {
      "family": "sans",
      "size": 15,
      "lineHeight": 19,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "label": {
      "family": "sans",
      "size": 14,
      "lineHeight": 20,
      "weight": 400,
      "letterSpacing": -0.2
    },
    "chipMd": {
      "family": "sans",
      "size": 13,
      "lineHeight": 16,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "tab": {
      "family": "sans",
      "size": 13,
      "lineHeight": 16,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "chip": {
      "family": "sans",
      "size": 12,
      "lineHeight": 16,
      "weight": 600,
      "letterSpacing": -0.2
    },
    "caption": {
      "family": "sans",
      "size": 12,
      "lineHeight": 16,
      "weight": 400,
      "letterSpacing": -0.2,
      "color": "text.secondary"
    },
    "note": {
      "family": "sans",
      "size": 12,
      "lineHeight": 17,
      "weight": 400,
      "letterSpacing": -0.2,
      "color": "text.tertiary"
    },
    "micro": {
      "family": "sans",
      "size": 11,
      "lineHeight": 14,
      "weight": 400,
      "letterSpacing": -0.2,
      "color": "text.tertiary"
    },
    "statusBar": {
      "family": "sans",
      "size": 15,
      "lineHeight": 18,
      "weight": 600
    },
    "monoLabel": {
      "family": "mono",
      "size": 11,
      "lineHeight": 14,
      "weight": 600,
      "letterSpacing": 1.4,
      "case": "upper",
      "color": "text.tertiary"
    },
    "monoValue": {
      "family": "mono",
      "size": 12,
      "lineHeight": 16,
      "weight": 600,
      "letterSpacing": 0
    },
    "monoCode": {
      "family": "mono",
      "size": 20,
      "lineHeight": 24,
      "weight": 600,
      "letterSpacing": 0.5
    },
    "monoMicro": {
      "family": "mono",
      "size": 10,
      "lineHeight": 12,
      "weight": 600,
      "letterSpacing": 0.8
    },
    "devnet": {
      "family": "mono",
      "size": 9,
      "lineHeight": 12,
      "weight": 600,
      "letterSpacing": 0.8
    },
    "wordmark": {
      "family": "sans",
      "size": 44,
      "lineHeight": 44,
      "weight": 900,
      "letterSpacing": -2
    },
    "wordmarkSm": {
      "family": "sans",
      "size": 30,
      "lineHeight": 30,
      "weight": 900,
      "letterSpacing": -1.4
    }
  },
  "space": {
    "0": 0,
    "2": 2,
    "4": 4,
    "5": 5,
    "6": 6,
    "8": 8,
    "10": 10,
    "11": 11,
    "12": 12,
    "14": 14,
    "16": 16,
    "18": 18,
    "20": 20,
    "22": 22,
    "24": 24,
    "28": 28,
    "34": 34,
    "screenX": 20,
    "blockGap": 14,
    "cardPad": 16,
    "rowGap": 6,
    "pinBottom": 34,
    "pinGap": 6,
    "tabBarBottom": 28,
    "headerTop": 56,
    "contentTopHeader": 108,
    "contentTopNav": 110,
    "contentTopPlain": 58,
    "contentTopLock": 74,
    "contentBottomTabs": 104
  },
  "radius": {
    "xs": 2,
    "seg": 4,
    "cell": 7,
    "sm": 9,
    "tile": 12,
    "md": 14,
    "chip": 15,
    "lg": 18,
    "xl": 20,
    "input": 22,
    "panel": 24,
    "card": 26,
    "hero": 28,
    "cam": 30,
    "sheet": 38,
    "phone": 48,
    "pill": 999
  },
  "size": {
    "tap": 44,
    "button": 54,
    "buttonText": 44,
    "buttonCard": 50,
    "rowButton": 36,
    "headerBtn": 36,
    "navBack": 40,
    "tabBar": 64,
    "tabItem": 52,
    "plus": 64,
    "shutter": 80,
    "iconTile": 40,
    "iconTileLg": 44,
    "avatarRow": 40,
    "avatarSlot": 44,
    "toggle": [
      46,
      28
    ],
    "toggleKnob": 22,
    "statusBar": 48,
    "sheetGrabber": [
      36,
      5
    ]
  },
  "shadow": {
    "card": {
      "css": "inset 0 0 0 1px rgba(255,255,255,0.08), 0 24px 40px rgba(0,0,0,0.45)",
      "android": {
        "elevation": 12
      },
      "ios": {
        "offset": [
          0,
          24
        ],
        "radius": 20,
        "opacity": 0.45
      }
    },
    "float": {
      "css": "0 8px 20px rgba(0,0,0,0.40)",
      "android": {
        "elevation": 6
      }
    },
    "cover": {
      "css": "0 20px 40px rgba(0,0,0,0.40)",
      "android": {
        "elevation": 10
      }
    },
    "tabBar": {
      "css": "inset 0 0 0 1px rgba(255,255,255,0.07), 0 10px 30px rgba(0,0,0,0.50)",
      "android": {
        "elevation": 10
      }
    },
    "note": {
      "css": "0 18px 44px rgba(0,0,0,0.60)",
      "android": {
        "elevation": 16
      }
    },
    "toast": {
      "css": "0 10px 30px rgba(0,0,0,0.50)",
      "android": {
        "elevation": 14
      }
    },
    "optionOn": {
      "css": "0 12px 26px rgba(0,0,0,0.45)",
      "android": {
        "elevation": 8
      }
    },
    "tile3d": {
      "css": "inset 0 1.5px 0 rgba(255,255,255,0.60), inset 0 -3px 0 rgba(0,0,0,0.18), 0 6px 14px rgba(0,0,0,0.35)",
      "rn": "top 1.5dp highlight View + bottom 3dp shade View inside the tile, then elevation 4"
    },
    "buttonPrimary": {
      "css": "inset 0 -3px 0 rgba(0,0,0,0.10), 0 10px 24px rgba(0,0,0,0.30)"
    },
    "buttonLime": {
      "css": "inset 0 1.5px 0 rgba(255,255,255,0.65), inset 0 -3px 0 rgba(0,0,0,0.16), 0 12px 30px rgba(197,242,92,0.22)"
    },
    "plus": {
      "css": "inset 0 -4px 0 rgba(0,0,0,0.15), 0 10px 24px rgba(0,0,0,0.50)"
    },
    "moneyPill": {
      "css": "inset 0 3px 0 rgba(255,255,255,0.60), inset 0 -6px 0 rgba(0,0,0,0.16), 0 22px 50px rgba(197,242,92,0.28)"
    },
    "coin": {
      "css": "inset 0 0 0 3px rgba(255,255,255,0.25), 0 3px 0 #5E7A14"
    }
  },
  "gradient": {
    "card": {
      "angle": 180,
      "stops": [
        [
          "#272727",
          0
        ],
        [
          "#1D1D1D",
          1
        ]
      ]
    },
    "cardSheen": {
      "angle": 115,
      "stops": [
        [
          "rgba(255,255,255,0.07)",
          0
        ],
        [
          "rgba(255,255,255,0)",
          0.38
        ]
      ]
    },
    "buttonPrimary": {
      "angle": 180,
      "stops": [
        [
          "#FFFFFF",
          0
        ],
        [
          "#E9E9E9",
          1
        ]
      ]
    },
    "buttonLime": {
      "angle": 180,
      "stops": [
        [
          "#DAFF80",
          0
        ],
        [
          "#B4E53F",
          1
        ]
      ]
    },
    "moneyPill": {
      "angle": 180,
      "stops": [
        [
          "#DAFF80",
          0
        ],
        [
          "#B0E03C",
          1
        ]
      ]
    },
    "brandTile": {
      "angle": 180,
      "stops": [
        [
          "#DAFF80",
          0
        ],
        [
          "#B4E53F",
          1
        ]
      ]
    },
    "coin": {
      "type": "radial",
      "center": [
        0.35,
        0.3
      ],
      "stops": [
        [
          "#F4FFD0",
          0
        ],
        [
          "#C5F25C",
          0.52
        ],
        [
          "#8FB52E",
          1
        ]
      ]
    },
    "camera": {
      "type": "radial",
      "center": [
        0.5,
        0.45
      ],
      "stops": [
        [
          "#2A2A2E",
          0
        ],
        [
          "#0A0A0B",
          0.75
        ]
      ]
    },
    "tabFade": {
      "angle": 180,
      "stops": [
        [
          "rgba(19,19,19,0)",
          0
        ],
        [
          "#131313",
          0.55
        ]
      ],
      "height": 120
    },
    "shine": {
      "angle": 100,
      "stops": [
        [
          "rgba(255,255,255,0)",
          0
        ],
        [
          "rgba(255,255,255,0.55)",
          0.5
        ],
        [
          "rgba(255,255,255,0)",
          1
        ]
      ],
      "widthPct": 40
    },
    "uploadHatch": "repeating 135deg #171717 0–10, #1A1A1A 10–20"
  },
  "material": {
    "keeperNoteTile": "radial(circle at 50% 30%, #2A2A30 → #131313 70%)",
    "beam": "linear 180deg rgba(255,255,255,0.22) → 0.05 at 55% → 0, trapezoid clip (43% 0, 57% 0, 100% 100%, 0 100%), blur 14",
    "blur": {
      "beam": 14,
      "keeperShadow": 9,
      "reviewPhoto": 1.2
    }
  },
  "motion": {
    "easing": {
      "spring": [
        0.3,
        1.5,
        0.5,
        1
      ],
      "springSoft": [
        0.3,
        1.45,
        0.5,
        1
      ],
      "springHard": [
        0.3,
        1.6,
        0.5,
        1
      ],
      "enter": [
        0.2,
        0.8,
        0.2,
        1
      ],
      "burst": [
        0.15,
        0.7,
        0.3,
        1
      ],
      "rise": [
        0.2,
        0.7,
        0.3,
        1
      ],
      "draw": [
        0.5,
        0,
        0.3,
        1
      ],
      "inOut": "ease-in-out",
      "linear": "linear"
    },
    "duration": {
      "toggle": 150,
      "flex": 200,
      "optionTilt": 250,
      "segPop": 300,
      "cellPop": 350,
      "drawCheck": 320,
      "note": 420,
      "pop": 450,
      "enter": 500,
      "slotPop": 450,
      "bubble": 500,
      "money": 600,
      "splashTile": 550,
      "beat": 1000,
      "spin": 1100,
      "burst": 1300,
      "scan": 1500,
      "ping": 1800,
      "beatSlow": 1800,
      "toastHold": 1900,
      "signAuto": 2200,
      "glow": 2600,
      "kUp": 2800,
      "shine": 3400,
      "float": 4500,
      "beam": 5000,
      "breath": 7000,
      "drift": 16000,
      "noteHold": 4800
    },
    "stagger": {
      "block": 65,
      "blockStart": 40,
      "hpSeg": 28,
      "cardSeg": 22,
      "gridRow": 60,
      "gridCol": 40,
      "days": 70,
      "slot": 90,
      "burstCoin": 25
    },
    "reduceMotion": "All animations collapse to their end state (duration ≈ 0, 1 iteration, no delay)."
  },
  "z": {
    "content": 5,
    "fx": 50,
    "statusBar": 40,
    "header": 10,
    "tabFade": 18,
    "tabBar": 20,
    "pin": 20,
    "scrim": 24,
    "sheet": 26,
    "keeperNote": 45,
    "toast": 60
  }
} as const;
export type Tokens = typeof tokens;
