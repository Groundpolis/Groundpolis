<template>
<div>
	<div class="_section _vMargin">
		<div class="_content">
			<p v-text="$t('_labs.description')"/>
		</div>
		<div class="_card _vMargin">
			<div class="_content">
				<MkSwitch v-model:value="injectUnlistedNoteInLTL">
					{{ $t('showUnlistedNotesInLTL') }}
					<template #desc>{{ $t('showUnlistedNotesInLTLDesc') }}</template>
				</MkSwitch>
			</div>
		</div>
		<div class="_card _vMargin">
			<div class="_content">
				<MkSwitch v-model:value="debug" @update:value="changeDebug">
					DEBUG MODE
				</MkSwitch>
				<MkButton full @click="regedit">Registry Editor</MkButton>
				<MkButton full @click="taskmanager">Task Manager</MkButton>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import MkSwitch from '@/components/ui/switch.vue';
import MkButton from '@/components/ui/button.vue';
import { debug } from '@/config';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkSwitch,
		MkButton,
	},

	data() {
		return {
			debug
		}
	},

	computed: {
		injectUnlistedNoteInLTL: {
			get() { return this.$store.state.settings.injectUnlistedNoteInLTL; },
			set(value) { this.$store.dispatch('settings/set', { key: 'injectUnlistedNoteInLTL', value }); }
		},
	},

	watch: {
		injectUnlistedNoteInLTL() {
			location.reload();
		},
	},

	methods: {
		changeDebug(v) {
			localStorage.setItem('debug', v.toString());
			location.reload();
		},

		regedit() {
			os.pageWindow('/regedit');
		},

		taskmanager() {
			os.popup(import('@/components/taskmanager.vue'), {
			}, {}, 'closed');
		}
	},
});
</script>
