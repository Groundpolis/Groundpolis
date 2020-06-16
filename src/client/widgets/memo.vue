<template>
<div>
	<mk-container :show-header="!props.compact">
		<template #header><fa :icon="faStickyNote"/>{{ $t('_widgets.memo') }}</template>

		<div class="otgbylcu">
			<textarea v-model="text" :placeholder="$t('placeholder')" @input="onChange"></textarea>
		</div>
	</mk-container>
</div>
</template>

<script lang="ts">
import { faStickyNote } from '@fortawesome/free-solid-svg-icons';
import MkContainer from '../components/ui/container.vue';
import define from './define';

export default define({
	name: 'memo',
	props: () => ({
		compact: false,
		memo: ''
	})
}).extend({
	
	components: {
		MkContainer
	},

	computed: {
		text: {
			get() { return this.props.memo; },
			set(value: string) {
				this.props.memo = value;
				this.save();
			}
		}
	},

	data() {
		return {
			faStickyNote
		};
	},

	created() {
		if (this.text === null) {
			// migration
			this.text = this.$store.state.settings.memo;
		}
	},

	methods: {
		func() {
			this.props.compact = !this.props.compact;
			this.save();
		},
	}
});
</script>

<style lang="scss" scoped>
.otgbylcu {
	padding-bottom: 28px + 16px;

	> textarea {
		display: block;
		width: 100%;
		max-width: 100%;
		min-width: 100%;
		padding: 16px;
		color: var(--inputText);
		background: var(--face);
		border: none;
		border-bottom: solid var(--lineWidth) var(--faceDivider);
		border-radius: 0;
		box-sizing: border-box;
	}

	> button {
		display: block;
		position: absolute;
		bottom: 8px;
		right: 8px;
		margin: 0;
		padding: 0 10px;
		height: 28px;
		outline: none;
		border-radius: 4px;

		&:disabled {
			opacity: 0.7;
			cursor: default;
		}
	}
}
</style>
