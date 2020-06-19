import Vue from 'vue';

import autocomplete from './autocomplete';
import size from './size';
import particle from './particle';
import tooltip from './tooltip';

Vue.directive('autocomplete', autocomplete);
Vue.directive('size', size);
Vue.directive('particle', particle);
Vue.directive('tooltip', tooltip);
