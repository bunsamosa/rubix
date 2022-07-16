<script setup lang="ts"></script>

<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-title>Rubix</v-app-bar-title>
      <v-tabs align-with-title>
        <v-tab>
          <router-link to="/">Home</router-link>
        </v-tab>
        <v-tab>
          <router-link to="/world">World</router-link>
        </v-tab>
        <!-- <v-tab>
          <router-link to="/cube">Cube</router-link>
        </v-tab>
        <v-tab>
          <router-link to="/star">Star</router-link>
        </v-tab> -->
        <v-tab>
          <router-link to="/robot">Robot</router-link>
        </v-tab>
      </v-tabs>
    </v-app-bar>
    <router-view />
  </v-app>
</template>
