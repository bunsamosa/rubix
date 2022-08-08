<script>
import VideoPlayer from '@/components/VideoPlayer/VideoPlayerComponent.vue';


// wrap video player component
export default {
    name: 'VideoStream',
    components: {
        VideoPlayer
    },
    data() {
        return {};
    }
};
</script>

<template>
    <v-container>
        <VideoPlayer />
    </v-container>
</template>
