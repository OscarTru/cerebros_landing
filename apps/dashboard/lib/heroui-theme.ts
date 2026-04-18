import type { ConfigThemes } from "@heroui/react"

export const cerebrosThemes: ConfigThemes = {
  light: {
    colors: {
      background: "#f5f5f5",
      foreground: "#0a0a0b",
      divider: "rgba(0, 0, 0, 0.1)",
      focus: "#0a0a0b",
      content1: "#ffffff",
      content2: "#f0f0f0",
      content3: "#e5e5e5",
      content4: "#d4d4d4",
      default: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#71717a",
        600: "#52525b",
        700: "#3f3f46",
        800: "#27272a",
        900: "#18181b",
        DEFAULT: "#f5f5f5",
        foreground: "#0a0a0b",
      },
      primary: {
        DEFAULT: "#0a0a0b",
        foreground: "#ffffff",
      },
    },
  },
  dark: {
    colors: {
      background: "#0a0a0b",
      foreground: "#f4f4f5",
      divider: "rgba(255, 255, 255, 0.08)",
      focus: "#ffffff",
      content1: "rgba(255, 255, 255, 0.04)",
      content2: "rgba(255, 255, 255, 0.07)",
      content3: "rgba(255, 255, 255, 0.1)",
      content4: "rgba(255, 255, 255, 0.14)",
      default: {
        50: "#18181b",
        100: "#27272a",
        200: "#3f3f46",
        300: "#52525b",
        400: "#71717a",
        500: "#a1a1aa",
        600: "#d4d4d8",
        700: "#e4e4e7",
        800: "#f4f4f5",
        900: "#fafafa",
        DEFAULT: "rgba(255, 255, 255, 0.07)",
        foreground: "#f4f4f5",
      },
      primary: {
        DEFAULT: "#ffffff",
        foreground: "#000000",
      },
    },
  },
}
