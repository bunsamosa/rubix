<script setup lang="ts">
</script>

<template>
  <v-app>
    <v-main>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/sample">Sample</router-link>
      </nav>
      <router-view />
      <div id="mycanvas"></div>
    </v-main>
  </v-app>
</template>
