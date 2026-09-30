const DEFAULT_COLORS = ["#1f1a16", "#c45c26", "#e8dccf", "#3d6b5a"];
const STORAGE_KEY = "palette-preview-colors";

const swatchesEl = document.getElementById("swatches");
const addButton = document.getElementById("add-swatch");
const themeButton = document.getElementById("theme-toggle");
const contrastEl = document.getElementById("contrast");

function loadColors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map(toHex);
    }
  } catch {
    // Ignore invalid saved state.
  }
  return [...DEFAULT_COLORS];
}

function saveColors() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

function render() {
  swatchesEl.innerHTML = "";
  for (const [index, color] of colors.entries()) {
    const card = document.createElement("article");
    card.className = "swatch";

    const chip = document.createElement("div");
    chip.className = "chip";
    chip.style.background = color;

    const input = document.createElement("input");
    input.type = "color";
    input.value = toHex(color);
    input.setAttribute("aria-label", `Color ${index + 1}`);
    input.addEventListener("input", (event) => {
      colors[index] = event.target.value;
      chip.style.background = event.target.value;
      hex.value = event.target.value;
      saveColors();
      updateContrast();
    });

    const hex = document.createElement("input");
    hex.type = "text";
    hex.value = toHex(color);
    hex.setAttribute("aria-label", `Hex for color ${index + 1}`);
    hex.addEventListener("change", (event) => {
      const next = toHex(event.target.value);
      colors[index] = next;
      input.value = next;
      chip.style.background = next;
      hex.value = next;
      saveColors();
      updateContrast();
    });

    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Copy hex";
    copy.addEventListener("click", async () => {
      await navigator.clipboard.writeText(toHex(colors[index]));
      copy.textContent = "Copied";
      setTimeout(() => {
        copy.textContent = "Copy hex";
      }, 1200);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      colors.splice(index, 1);
      saveColors();
      render();
    });

    card.append(chip, input, hex, copy, remove);
    swatchesEl.append(card);
  }
  updateContrast();
}

function luminance(hex) {
  const value = toHex(hex).slice(1);
  const rgb = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a, b) {
  const left = luminance(a);
  const right = luminance(b);
  const lighter = Math.max(left, right);
  const darker = Math.min(left, right);
  return (lighter + 0.05) / (darker + 0.05);
}

function updateContrast() {
  if (colors.length < 2) {
    contrastEl.textContent = "Add at least two colors to see contrast.";
    return;
  }
  const ratio = contrastRatio(colors[0], colors[1]);
  const aa = ratio >= 4.5 ? "AA pass" : "AA fail";
  contrastEl.textContent = `Contrast between the first two colors: ${ratio.toFixed(2)}:1 (${aa}).`;
}

function toHex(value) {
  const raw = String(value).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return "#888888";
}

const colors = loadColors();
addButton.addEventListener("click", () => {
  colors.push("#888888");
  saveColors();
  render();
});
themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
render();
