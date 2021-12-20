<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">{{ $ts._template.desc }}</div>
	</div>
	<div class="_formItem" v-if="templates.length === 0">
		<div class="_formLabel" style="font-size: 100%">{{ $ts._template.nothing }}</div>
	</div>
	<template v-else>
		<FormSwitch v-model:value="isDeleteMode"><Fa :icon="faTrashAlt" /> {{ $ts.deleteMode }}</FormSwitch>
		<FormGroup>
			<FormButton v-for="t in templates" :key="t.label" @click="(isDeleteMode ? del : edit)(t)" :danger="isDeleteMode">
				<Fa v-if="isDeleteMode" :icon="faTimesCircle" /> {{ t.label }}
			</FormButton>
		</FormGroup>
	</template>
	<FormButton v-if="!isDeleteMode" @click="createNew" primary><Fa :icon="faPlus" /> {{ $ts.createNew }}</FormButton>
	<MkInfo>{{$ts._template.info}}</MkInfo>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faPlus, faTrashAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import MkInfo from '@/components/ui/info.vue';
import * as os from '@/os';
import { Template } from '@/store';

export default defineComponent({
	components: {
		FormBase,
		FormButton,
		FormLink,
		FormGroup,
		FormSwitch,
		MkInfo
	},

	data() {
		return {
			isDesktop: window.innerWidth >= 1100,
			templates: this.$store.reactiveState.templates.value.map(v => ({ ...v })),
			isDeleteMode: false,
			faPlus, faTrashAlt, faTimesCircle,
		};
	},

	methods: {
		async createNew() {
			const { canceled, result } = await os.form(this.$ts.createNew, {
				label: {
					type: 'string',
					label: this.$ts._template.label,
					description: this.$ts._template.labelDesc,
					default: '',
				},
				body: {
					type: 'string',
					label: this.$ts._template.body,
					default: '',
					multiline: true,
				},
			});
			if (canceled) return;

			const newData: Template = {
				label: result.label,
				body: result.body,
			};

			this.templates.push(newData);
			this.$store.set('templates', [...this.templates]);

		},
		async edit(template: Template) {
			const templateIndex = this.templates.findIndex(t => t.label === template.label);
			const { canceled, result } = await os.form(this.$ts.createNew, {
				label: {
					type: 'string',
					label: this.$ts._template.label,
					description: this.$ts._template.labelDesc,
					default: template.label,
				},
				body: {
					type: 'string',
					label: this.$ts._template.body,
					default: template.body,
					multiline: true,
				},
			});
			if (canceled) return;

			const newData: Template = {
				label: result.label,
				body: result.body,
			};

			this.templates[templateIndex] = newData;
			this.$store.set('templates', [...this.templates]);
		},
		async del(template: Template) {
			const { canceled } = await os.dialog({
				type: 'warning',
				text: this.$t('deleteAreYouSure', { x: template.label }),
				showCancelButton: true
			});
			if (canceled) return;
			this.templates = this.templates.filter(t => t.label !== template.label);
			if (this.templates.length === 0) {
				this.isDeleteMode = false;
			}
			this.$store.set('templates', [...this.templates]);
		}
	}
});
</script>
