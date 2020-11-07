<template>
<div>
	<div class="_section">
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
			<div class="_content">
				<MkSwitch v-model:value="$store.state.i.injectFeaturedNote" @update:value="onChangeInjectFeaturedNote">
					{{ $t('showFeaturedNotesInTimeline') }}
				</MkSwitch>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import MkSwitch from '@/components/ui/switch.vue';
import MkSelect from '@/components/ui/select.vue';
import MkButton from '@/components/ui/button.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkSwitch,
		MkSelect,
		MkButton,
	},

	emits: ['info'],
	
	data() {
		return {
			INFO: {
				title: this.$t('other'),
				icon: faEllipsisH
			}
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

	mounted() {
		this.$emit('info', this.INFO);
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
	}
});
</script>
