<template>
<div class="civpbkhh">
	<div v-for="note in notes" class="note">
		<div class="content _panel">
			<Mfm plain no-sticker :text="note.text" />
		</div>
		<XReactionsViewer :note="note" ref="reactionsViewer"/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import XReactionsViewer from '@/components/reactions-viewer.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		XReactionsViewer
	},

	data() {
		return {
			notes: [],
		}
	},

	created() {
		const ep = 
			!this.$instance.disableFeatured 
				? 'notes/featured' :
			!this.$instance.disableLocalTimeline
				? 'notes/local-timeline' : 'notes/global-timeline';
		os.api(ep).then(notes => {
			this.notes = notes.filter(n => n.text);
		});
	}
});
</script>

<style lang="scss" scoped>
.civpbkhh {
	text-align: right;

	> .note {
		margin: 16px 0 16px auto;

		> .content {
			padding: 16px;
			margin: 0 0 0 auto;
			max-width: max-content;
			border-radius: 16px;
			max-height: 10rem;
		}
	}
}
</style>
