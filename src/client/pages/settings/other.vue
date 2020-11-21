<template>
<div>
	<div class="_section">
		<div class="_card _vMargin">
			<div class="_content">
				<MkSwitch v-model:value="$store.state.i.injectFeaturedNote" @update:value="onChangeInjectFeaturedNote">
					{{ $t('showFeaturedNotesInTimeline') }}
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
		<div class="_card _vMargin">
			<div class="_title">{{$t('stealingRule')}}</div>
			<div class="_content">
				<MkSelect v-model:value="stealRule">
					<option :value="0">{{ $t('_steal.textOnly') }}</option>
					<option :value="1">{{ $t('_steal.react') }}</option>
					<option :value="2">{{ $t('_steal.renote') }}</option>
					<option :value="3">{{ $t('_steal.url') }}</option>
				</MkSelect>
				<MkButton v-if="stealRule === 1" @click="chooseReaction">
					<mfm :text="$store.state.settings.stealReaction" :plain="true" />
					<span style="margin-left: 16px" v-text="$t('chooseReaction')" />
				</MkButton>
			</div>
		</div>
		<div class="_card _vMargin">
			<div class="_title">{{$t('dangerousSettings')}}</div>
			<div class="_content">
				<MkButton class="_vMargin" @click="discardPostFormDraft" full><Fa :icon="faTrashAlt"/> {{ $t('discardPostFormDraft') }}</MkButton>
				<div class="_caption _vMargin" style="padding: 0 6px;">{{ $t('discardPostFormDraftDescription') }}</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import MkSwitch from '@/components/ui/switch.vue';
import MkSelect from '@/components/ui/select.vue';
import MkButton from '@/components/ui/button.vue';
import * as os from '@/os';
import { debug } from '@/config';

export default defineComponent({
	components: {
		MkSwitch,
		MkSelect,
		MkButton,
	},

	data() {
		return {
			debug,
			faTrashAlt,
		}
	},

	computed: {
		stealRule: {
			get() { return this.$store.state.settings.stealRule; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealRule', value }); }
		},
		stealReaction: {
			get() { return this.$store.state.settings.stealReaction; },
			set(value) { this.$store.dispatch('settings/set', { key: 'stealReaction', value }); }
		},
	},

	methods: {
		onChangeInjectFeaturedNote(v) {
			os.api('i/update', {
				injectFeaturedNote: v
			});
		},
		async chooseReaction(e) {
			this.stealReaction = (await os.reactionPicker({
				source: e.currentTarget || e.target,
				showFocus: false,
				showDislike: false,
			})).reaction;
		},
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
		},
		
		discardPostFormDraft() {
			localStorage.removeItem('drafts');
		},
	}
});
</script>
