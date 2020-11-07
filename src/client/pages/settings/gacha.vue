<template>
<div class="_section">
	<section class="_card">
		<div class="_title">{{ $t('gachaSettings') }}</div>
		<div class="_content">
			<MkTextarea v-model:value="faces">{{ $t('gachaFaces') }}<template #desc>{{ $t('gachaSettingDescription') }}</template></MkTextarea>
		</div>
		<div class="_footer">
			<MkButton @click="reset()" inline><fa :icon="faUndo"/> {{ $t('default') }}</MkButton>
			<MkButton @click="save()" primary inline :disabled="!changed"><fa :icon="faSave"/> {{ $t('save') }}</MkButton>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import MkTextarea from '../../components/ui/textarea.vue';
import MkButton from '../../components/ui/button.vue';
import defaultFaces from '../../scripts/default-faces';
export default defineComponent({
	components: {
		MkTextarea,
		MkButton,
	},
	
	data() {
		return {
			faces: this.$store.state.settings.faces.join('\n') as string,
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
			os.dialog({
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
