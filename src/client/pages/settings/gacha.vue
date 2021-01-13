<template>
<FormBase>
	<FormTextarea v-model:value="faces" :max="500">
		<span>{{ $ts.gachaFaces }}</span>
		<template #desc>{{ $ts.gachaSettingDescription }}</template>
	</FormTextarea>
	<FormTuple>
		<FormButton @click="reset()"><fa :icon="faUndo"/> {{ $ts.default }}</FormButton>
		<FormButton @click="save()" primary :disabled="!changed"><fa :icon="faSave"/> {{ $ts.save }}</FormButton>
	</FormTuple>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import FormTextarea from '../../components/form/textarea.vue';
import FormBase from '../../components/form/base.vue';
import FormGroup from '../../components/form/group.vue';
import FormTuple from '../../components/form/tuple.vue';
import FormButton from '../../components/form/button.vue';
import defaultFaces from '../../scripts/default-faces';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormTextarea,
		FormBase,
		FormButton,
		FormGroup,
		FormTuple,
	},
	
	data() {
		return {
			faces: this.$store.state.faces.join('\n') as string,
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
			this.$store.set('faces', this.faces.trim().split('\n'));
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
