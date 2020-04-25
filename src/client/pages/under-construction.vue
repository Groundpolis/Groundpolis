<template>
    <div>
        <portal to="icon"><fa :icon="faClock"/></portal>
        <portal to="title">WIP</portal>

        <section class="_card">
            <div class="_content">
                <div>開発中です...すみません</div>
                <div>I'm sorry, but this page is under development...</div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { faClock } from '@fortawesome/free-solid-svg-icons';
export default Vue.extend({
    data() {
        return {
            faClock
        }
    },
})
</script>