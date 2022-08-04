<script setup lang="ts">
import { Game } from "./game";

// fetch container ID from props
const props = defineProps<{
    container: string
}>();
const container: HTMLElement = document.getElementById(props.container) as HTMLElement;

// create game
const game = new Game(container);
</script>

<template>
</template>
