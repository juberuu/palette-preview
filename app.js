const DEFAULT_COLORS = ["#1f1a16", "#c45c26", "#e8dccf", "#3d6b5a"];

const swatchesEl = document.getElementById("swatches");
const addButton = document.getElementById("add-swatch");

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
      render();
    });

    card.append(chip, input, hex, copy, remove);
    swatchesEl.append(card);
  }
}

function toHex(value) {
  const raw = String(value).trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return raw.toLowerCase();
  }
  return "#888888";
}

const colors = [...DEFAULT_COLORS];
addButton.addEventListener("click", () => {
  colors.push("#888888");
  render();
});
render();
