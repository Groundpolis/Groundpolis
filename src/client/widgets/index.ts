import Vue from 'vue';

Vue.component('mkw-memo', () => import('./memo.vue').then(m => m.default));
Vue.component('mkw-calendar', () => import('./calendar.vue').then(m => m.default));
Vue.component('mkw-rss', () => import('./rss.vue').then(m => m.default));
Vue.component('mkw-clock', () => import('./clock.vue').then(m => m.default));
Vue.component('mkw-activity', () => import('./activity.vue').then(m => m.default));
Vue.component('mkw-photos', () => import('./photos.vue').then(m => m.default));
