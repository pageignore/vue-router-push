# vue-router-push

One line command, write router file and create new page file.

## Install
`npm i -g vue-router-push`

## Usage

`vrp /user/info/list`


Make sure you have `vrp.config.json` in your root directory.

```json
{
    "routerPath": "/src/router/index.ts",
    "pageDir": "/src/views",
    "componentPrefix": "../views"
}
```

The routing configuration is saved using a variable called routes.

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [{
  path: '/',
  name: 'home',
  component: HomeView
}, {
  path: '/about',
  name: 'about',
  component: () => import('../views/AboutView.vue'),
}];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});
export default router;
```

You can choose to create a file `vrp.template.vue` in the root directory to use as a template for new files, or use the default.

```vue
<script lang="ts" setup>
    import { reactive, ref } from 'vue';
    const state = reactive({});
</script>
<template>
    <div class="">
        <router-view></router-view>
    </div>
</template>
<style>
    
</style>
```

