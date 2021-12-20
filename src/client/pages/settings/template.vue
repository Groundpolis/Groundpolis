<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">{{ $ts._template.desc }}</div>
	</div>
	<MkInfo>{{$ts._template.info}}</MkInfo>

	<MkTab v-model:value="tab" class="_mb-2">
		<option value="manage">
			<Fa :icon="faCog" />
			{{ $ts.manage }}
		</option>
		<option value="import">
			<Fa :icon="faUpload" />
			{{ $ts.import }}
		</option>
		<option value="export">
			<Fa :icon="faDownload" />
			{{ $ts.export }}
		</option>
	</MkTab>

	<template v-if="tab === 'manage'">
		<div class="_formItem" v-if="templates.length === 0">
			<div class="_formLabel" style="font-size: 100%">{{ $ts._template.nothing }}</div>
		</div>
		<FormButton @click="createNew" primary><Fa :icon="faPlus" /> {{ $ts.createNew }}</FormButton>
		<template v-if="templates.length > 0">
			<FormGroup>
				<FormSwitch v-model:value="isDeleteMode"><Fa :icon="faTrashAlt" /> {{ $ts.deleteMode }}</FormSwitch>
				<FormButton v-for="t in templates" :key="t.label" @click="(isDeleteMode ? del : edit)(t)" :danger="isDeleteMode">
					<Fa v-if="isDeleteMode" :icon="faTimesCircle" />
					<Fa v-else :icon="faEdit" />
					{{ t.label }}
				</FormButton>
			</FormGroup>
		</template>
	</template>
	<template v-else-if="tab === 'import'">
		<FormTextarea tall v-model:value="importText">
			<span>{{ $ts._template.data }}</span>
		</FormTextarea>
		<FormSwitch v-model:value="isOverwriteMode">
			{{ $ts._template.overwriteMode }}
			<template #desc>{{$ts._template.overwriteModeDesc}}</template>
		</FormSwitch>
		<FormButton @click="importData" :disabled="!canImport" primary><Fa :icon="faUpload" fixed-width /> {{ $ts.import }}</FormButton>
	</template>
	<template v-else-if="tab === 'export'">
		<FormTextarea tall readonly :value="exportText">
			<span>{{ $ts._template.data }}</span>
			<template #desc>{{$ts._template.exportDesc}}</template>
		</FormTextarea>
	</template>

</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faPlus, faTrashAlt, faTimesCircle, faUpload, faDownload, faCog, faEdit } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormTextarea from '@/components/form/textarea.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import MkInfo from '@/components/ui/info.vue';
import MkTab from '@/components/tab.vue';
import * as os from '@/os';
import { Template } from '@/store';

export default defineComponent({
	components: {
		FormBase,
		FormButton,
		FormLink,
		FormGroup,
		FormSwitch,
		FormTextarea,
		MkInfo,
		MkTab,
	},

	data() {
		return {
			isDesktop: window.innerWidth >= 1100,
			templates: this.$store.reactiveState.templates.value.map(v => ({ ...v })),
			isDeleteMode: false,
			tab: 'manage',
			importText: '',
			isOverwriteMode: false,
			
			faPlus, faTrashAlt, faTimesCircle, faUpload, faDownload, faCog, faEdit
		};
	},

	computed: {
		exportText() {
			return JSON.stringify(this.templates, null, '    ');
		},
		canImport() {
			return Boolean(this.importText);
		},
	},

	methods: {
		async createNew() {
			this.isDeleteMode = false;
			const { canceled, result } = await os.form(this.$ts.createNew, {
				label: {
					type: 'string',
					label: this.$ts._template.label,
					description: this.$ts._template.labelDesc,
					default: '',
					required: true,
				},
				body: {
					type: 'string',
					label: this.$ts._template.body,
					default: '',
					multiline: true,
					required: true,
				},
			});
			if (canceled) return;
			if (!result.label || !result.body) return;

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
					required: true,
				},
				body: {
					type: 'string',
					label: this.$ts._template.body,
					default: template.body,
					multiline: true,
					required: true,
				},
			});
			if (canceled) return;
			if (!result.label || !result.body) return;

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
		},
		async importData() {
			try {
				const importedData = JSON.parse(this.importText);
				const importedTemplate = importedData as Template[];
				const tmp = this.isOverwriteMode ? [] : [...this.templates];
				const labels = new Set(tmp.map(t => t.label));

				// バリデーション: 配列かどうか
				if (!Array.isArray(importedData)) throw new Error('Error: Not an array');

				// バリデーション: 値が有効か
				if (!(importedTemplate).every(d => d.label && d.body)) throw new Error('Error: Invalid Data');

				// バリデーション: ラベルがかぶってないかどうか
				const duplicated = importedTemplate.map(d => d.label).find(l => labels.has(l));
				if (duplicated) throw new Error(`Error: '${duplicated}' has already registered`);

				(importedData as Template[]).forEach((d => {
					tmp.push({
						label: d.label,
						body: d.body
					});
				}));

				this.templates = tmp;
				this.$store.set('templates', [...tmp]);
				await os.dialog({
					type: 'success',
					text: this.$ts.added,
				});
			} catch (e) {
				await os.dialog({
					type: 'error',
					text: e.message,
				});
			}
		},
	}
});
</script>
