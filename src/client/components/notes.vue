<template>
<div class="mk-notes" v-size="[{ max: 500 }]" :class="{ compact: isCompactMode }">
	<div class="_fullinfo" v-if="empty">
		<div>{{ $t('noNotes') }}</div>
	</div>

	<mk-error v-if="error" @retry="init()"/>

	<div v-if="more && reversed" style="margin-bottom: var(--margin);">
		<button class="_panel _button" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }" @click="fetchMore()">
			<template v-if="!moreFetching">{{ $t('loadMore') }}</template>
			<template v-if="moreFetching"><mk-loading inline/></template>
		</button>
	</div>

	<x-list ref="notes" class="notes" :items="notes" v-slot="{ item: note }" :direction="reversed ? 'up' : 'down'" :reversed="reversed">
		<x-note :note="note" :detail="detail" :key="note._featuredId_ || note._prId_ || note.id"/>
	</x-list>

	<div v-if="more && !reversed" style="margin-top: var(--margin);">
		<button class="_panel _button" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }" @click="fetchMore()">
			<template v-if="!moreFetching">{{ $t('loadMore') }}</template>
			<template v-if="moreFetching"><mk-loading inline/></template>
		</button>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import paging from '../scripts/paging';
import XNote from './note.vue';
import XList from './date-separated-list.vue';

export default Vue.extend({
	i18n,

	components: {
		XNote, XList
	},

	mixins: [
		paging({
			before: (self) => {
				self.$emit('before');
			},

			after: (self, e) => {
				self.$emit('after', e);
			}
		}),
	],

	props: {
		pagination: {
			required: true
		},

		detail: {
			type: Boolean,
			required: false,
			default: false
		},

		extract: {
			required: false
		}
	},

	computed: {
		notes(): any[] {
			return this.extract ? this.extract(this.items) : this.items;
		},

		reversed(): boolean {
			return this.pagination.reversed;
		},

		isCompactMode(): boolean {
			return this.$store.state.device.postStyle === 'compact';
		},
	},

	methods: {
		focus() {
			this.$refs.notes.focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-notes {
	> .notes {
		> ::v-deep *:not(:last-child) {
			margin-bottom: var(--marginFull);
		}
	}

	&.compact {
		> .notes {
			> ::v-deep *:not(:last-child) {
				margin-bottom: 0;
			}
		}
	}

	&.max-width_500px {
		> .notes {
			> ::v-deep *:not(:last-child) {
				//margin-bottom: var(--marginHalf);
				margin-bottom: 0;
			}
		}
	}
}
</style>
