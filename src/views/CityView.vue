<script setup lang="ts">
import CityRenderer from "@/components/city/CityRenderer.vue";
</script>

<template>
    <div id="mapContainer" class="h-screen"></div>
    <Suspense>
        <CityRenderer containerID="mapContainer" />
    </Suspense>
</template>
