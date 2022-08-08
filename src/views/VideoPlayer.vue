<script>
import VideoPlayer from '@/components/videoPlayer/VideoPlayerComponent.vue';


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
