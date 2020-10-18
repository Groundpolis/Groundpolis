<template>
<section class="_card">
	<div class="_title">{{ $t('gachaSettings') }}</div>
	<div class="_content">
		<mk-textarea v-model="faces">{{ $t('gachaFaces') }}<template #desc>{{ $t('gachaSettingDescription') }}</template></mk-textarea>
	</div>
	<div class="_footer">
		<mk-button @click="reset()" inline><fa :icon="faUndo"/> {{ $t('default') }}</mk-button>
		<mk-button @click="save()" primary inline :disabled="!changed"><fa :icon="faSave"/> {{ $t('save') }}</mk-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import MkTextarea from '../../components/ui/textarea.vue';
import MkButton from '../../components/ui/button.vue';
import defaultFaces from '../../scripts/default-faces';

export default Vue.extend({
	components: {
		MkTextarea,
		MkButton,
	},
	
	data() {
		return {
			faces: this.$store.state.settings.faces.join('\n'),
			changed: false,
			faSave, faUndo
		}
	},

	watch: {
		faces() {
			this.changed = true;
		}
	},

	methods: {
		save() {
			this.$store.dispatch('settings/set', { key: 'faces', value: this.faces.trim().split('\n') });
			this.changed = false;

			this.$root.dialog({
				type: 'success',
				iconOnly: true, autoClose: true
			});
		},
		reset() {
			this.faces = defaultFaces.join('\n');
			this.changed = true;
		},
	}
});
</script>
