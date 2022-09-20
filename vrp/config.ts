export const ROOT = process.cwd();
export const templateFileName = 'vrp.template.vue';
export const configFileName = 'vrp.config.json';
export const routesVariableName = 'routes';

export const templateStr = `<script setup>
import { reactive, ref } from 'vue';
</script>
<template>
    <div class="">
        <router-view></router-view>
    </div>
</template>
<style>
    
</style>`