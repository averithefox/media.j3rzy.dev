import { type Writable, writable } from "svelte/store";
import type { PopUpData } from "$lib/types";

export const popupStore: Writable<PopUpData | null> = writable(null);