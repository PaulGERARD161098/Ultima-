import { contextFor } from "./leo-boussole-projets.mjs";

export function monterBoussoleCockpit() {
  const find = (id) => document.getElementById(id);
  const dialog = find("leo-rose");
  const macro = find("rose-vue-macro");
  const children = find("rose-vue-sousprojets");
  const navigation = find("rose-fil-ariane")?.parentElement;
  const select = find("repo-select");
  const label = find("active-cap-label");
  const input = find("user-input");
  if (
    !navigation ||
    !macro ||
    !children ||
    !select ||
    !label ||
    !input ||
    find("leo-project-map")
  )
    return;
  const iframe = document.createElement("iframe");
  iframe.id = "leo-project-map";
  iframe.title = "Boussole interactive des projets";
  iframe.src = new URL("../leo-boussole.html", import.meta.url).href;
  iframe.style.cssText =
    "width:100%;height:68vh;border:0;border-radius:12px;background:#0b1119";
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Autres raccourcis du cockpit";
  navigation.before(iframe, details);
  details.append(summary, navigation, macro, children);

  window.addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== iframe.contentWindow ||
      !dialog.open
    )
      return;
    if (
      event.data?.type !== "leo-select-cap" ||
      typeof event.data.id !== "string"
    )
      return;
    const cap = contextFor(event.data.id);
    if (
      !cap ||
      !Array.from(select.options).some(
        (option) => option.value === cap.repository,
      )
    )
      return;
    select.value = cap.repository;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    label.textContent = cap.path;
    dialog.close();
    input.focus();
  });
}
