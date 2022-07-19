<script setup lang="ts">
import { createMap } from "./mapBuilder";
import { initWebGLOverlay } from "./webGLBuilder";

// map container ID
const props = defineProps<{
    containerID: string;
}>();

// create a map
const mapOptions: MapOptions = {
    tilt: 60,
    heading: 0,
    center: { lat: 12.9751509, lng: 77.6022351 },
    zoom: 20,
    mapId: import.meta.env.VITE_MAP_ID,
};
const map: google.maps.Map = await createMap(props.containerID, mapOptions);

// add webgl overlay
initWebGLOverlay(map, mapOptions);
</script>

<template></template>
