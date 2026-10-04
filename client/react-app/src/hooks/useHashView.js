import { useSyncExternalStore } from "react";
import { VIEWS } from "../lib/tasks";

function subscribe(onChange) {
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
}

function getView() {
    const id = window.location.hash.replace(/^#\/?/, "");
    return VIEWS.find((view) => view.id === id) ?? VIEWS[0];
}

export function useHashView() {
    return useSyncExternalStore(subscribe, getView);
}
