<template>
<div class="mk-renote-form">
	<mk-note-preview class="preview" :note="note"/>
	<template v-if="!quote">
		<footer>
			<div class="buttons">
				<a class="quote" v-if="!quote" @click="onQuote">{{ $t('quote') }}</a>
				<ui-button class="button cancel" inline @click="cancel">{{ $t('cancel') }}</ui-button>
				<ui-button class="button ok"   inline :primary="visibility == 'public'" @click="ok('public')" :disabled="wait">
					<fa icon="globe"/> {{ 'Renote' }}
				</ui-button>
				<ui-button class="button home" inline :primary="visibility == 'home'"   @click="ok('home')"   :disabled="wait">
					<fa icon="home"/> {{ 'Renote' }}
				</ui-button>
			</div>
		</footer>
	</template>
	<template v-if="quote">
		<mk-post-form ref="form" :renote="note" @posted="onChildFormPosted"/>
	</template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';

export default Vue.extend({
	i18n: i18n('desktop/views/components/renote-form.vue'),

	props: {
		note: {
			type: Object,
			required: true
		}
	},

	data() {
		return {
			wait: false,
			quote: false,
			visibility: 'home'
		};
	},

	methods: {
		ok(v: string) {
			this.wait = true;
			this.$root.api('notes/create', {
				renoteId: this.note.id,
				visibility: v || this.visibility
			}).then(data => {
				this.$emit('posted');
				this.$notify(this.$t('success'));
			}).catch(err => {
				this.$notify(this.$t('failure'));
			}).then(() => {
				this.wait = false;
			});
		},

		cancel() {
			this.$emit('canceled');
		},

		onQuote() {
			this.quote = true;

			this.$nextTick(() => {
				(this.$refs.form as any).focus();
			});
		},

		onChildFormPosted() {
			this.$emit('posted');
		}
	}
});
</script>

<style lang="stylus" scoped>
.mk-renote-form
	> .preview
		margin 16px 22px

	> footer
		height 72px
		background var(--desktopRenoteFormFooter)

		> .buttons
			display flex
			padding 12px
			align-items center

			> .quote
				display block
				margin-right auto
				margin-left 8px

			> .button
				display block
				margin 4px

</style>
