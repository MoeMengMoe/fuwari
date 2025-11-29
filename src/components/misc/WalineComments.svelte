<script lang="ts">
import { onDestroy, onMount } from "svelte";

export let serverURL: string;

let waline:
        | { update: (config: Record<string, unknown>) => void; destroy: () => void }
        | undefined;
let container: HTMLDivElement;
let mutationObserver: MutationObserver | undefined;
let beforeSwapHandler: (() => void) | undefined;

const getDarkConfig = () =>
        document.documentElement.classList.contains("dark") ? "body.dark" : false;

const getLangConfig = () => document.documentElement.lang || "zh-CN";

const syncPath = () => {
        waline?.update({ path: location.pathname });
};

const ensureWalineStyle = () => {
	if (document.querySelector("link[data-waline-style]")) return;
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "https://cdn.jsdelivr.net/npm/@waline/client@v3/dist/waline.css";
	link.setAttribute("data-waline-style", "true");
	document.head.appendChild(link);
};

onMount(async () => {
	if (!serverURL) return;

	ensureWalineStyle();

	const { init } = await import(
		"https://cdn.jsdelivr.net/npm/@waline/client@v3/dist/waline.mjs"
	);

        waline = init({
                el: container,
                serverURL,
                path: location.pathname,
                comment: true,
                reaction: true,
                pageview: true,
                lang: getLangConfig(),
                dark: getDarkConfig(),
        });

        const handleThemeOrLang = () =>
                waline?.update({ dark: getDarkConfig(), lang: getLangConfig() });
        mutationObserver = new MutationObserver(handleThemeOrLang);
        mutationObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["class", "lang"],
        });

        document.addEventListener("astro:page-load", () => {
                syncPath();
                handleThemeOrLang();
        });
        beforeSwapHandler = () => waline?.destroy();
        document.addEventListener("astro:before-swap", beforeSwapHandler);
});

onDestroy(() => {
	waline?.destroy();
	mutationObserver?.disconnect();
	document.removeEventListener("astro:page-load", syncPath);
	if (beforeSwapHandler) {
		document.removeEventListener("astro:before-swap", beforeSwapHandler);
	}
});
</script>

<div bind:this={container} class="waline-card"></div>

<style>
  .waline-card {
    width: 100%;
  }
</style>
