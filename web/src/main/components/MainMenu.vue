<!-- Copyright © 2024 Samuel Justin Speth Gabay
     Licensed under the GNU Affero Public License, Version 3 -->

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStaticName, useNameUpdater } from '@main/nameUpdater';
import { readonly, onBeforeUnmount, type Ref } from 'vue';
import SocialLink from './SocialLink.vue';
import { localUrlForSubApp } from '@main/helpers';

const routes = useRouter().getRoutes();

const menuPages = [
  "IndexPage",
  "ResumePage",
  "ProjectsPage",
  "AboutPage",
] as const;

const menuRoutes = readonly(
  menuPages.map(p => routes.filter(r => r.name == p))
    .filter(rs => rs.length)
    .map(([r]) => ({
      name: r.name,
      // use nbsp so menu links don’t wrap
      title: r.meta.title.replace(/ /g, "\xA0"),
    }))
);

const menuLinks = [
  {
    title: "Mathematical Melodies",
    url: "/melodies",
  },
  {
    title: "Ranked Choice Voting Demo",
    url: "/vote-demo",
  },
] as const;

let myName: string | Ref<String>;

if (import.meta.env.SSR) {
  myName = useStaticName();
} else {
  const { nameRef, canceler } = useNameUpdater();
  myName = nameRef;

  onBeforeUnmount(canceler);
}
</script>

<template>
  <h1>{{ myName }}</h1>
  <nav class="menu">
    <span> <!-- left-side menu items -->
      <span class="menu-item" v-for="route in menuRoutes" :key="route.name">
        <template v-if="route.name == $route.name"><span class="a-tad-bold">{{ route.title }}</span></template>
        <RouterLink v-else :to="{ name: route.name }">{{ route.title }}</RouterLink>
      </span>
      <span class="menu-item" v-for="link in menuLinks" :key="link.url">
        <a :href="localUrlForSubApp(link.url)">{{ link.title.replace(/ /g, "\xA0") }}</a>
      </span>
    </span>
    <span class="align-right"> <!-- right-side menu items -->
      <SocialLink title="GitHub" href="https://github.com/burkenyo" icon-src="github-mark.svg"/>
      <SocialLink title="LinkedIn" href="https://www.linkedin.com/in/sammo-gabay" icon-src="linkedin-mark.svg"/>
    </span>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: space-between;
  gap: 2em;
}

span.a-tad-bold {
  font-weight: 500;
}

span.menu-item + span.menu-item::before {
  content: " | ";
}
</style>
