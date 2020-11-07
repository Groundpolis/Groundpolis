<template>
<div>
	<div class="_section">
		<div class="_card">
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
import * as os from '@/os';

export default defineComponent({
	components: {
		MkSwitch,
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

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		onChangeInjectFeaturedNote(v) {
			os.api('i/update', {
				injectFeaturedNote: v
			});
		},
	}
});
</script>
