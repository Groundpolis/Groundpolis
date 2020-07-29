<template>
<div class="mk-notes" :class="{ compact: isCompactMode }">
	<div class="_fullinfo" v-if="empty">
		<div>{{ $t('noNotes') }}</div>
	</div>

	<mk-error v-if="error" @retry="init()"/>

	<div v-show="more && reversed" style="margin-bottom: var(--margin);">
		<button class="_panel _button" ref="loadMore" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }">
			<template v-if="!moreFetching">{{ $t('loadMore') }}</template>
			<template v-if="moreFetching"><mk-loading inline/></template>
		</button>
	</div>

	<x-list ref="notes" :items="notes" v-slot="{ item: note }" :direction="reversed ? 'up' : 'down'" :reversed="reversed">
		<x-note :note="note" @updated="updated(note, $event)" :detail="detail" :key="note._featuredId_ || note._prId_ || note.id"/>
	</x-list>

	<div v-show="more && !reversed" style="margin-top: var(--margin);">
		<button class="_panel _button" ref="loadMore" :disabled="moreFetching" :style="{ cursor: moreFetching ? 'wait' : 'pointer' }">
			<template v-if="!moreFetching">{{ $t('loadMore') }}</template>
			<template v-if="moreFetching"><mk-loading inline/></template>
		</button>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import paging from '../scripts/paging';
import XNote from './note.vue';
import XList from './date-separated-list.vue';

export default Vue.extend({
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

		prop: {
			type: String,
			required: false
		}
	},

	computed: {
		notes(): any[] {
			return this.prop ? this.items.map(item => item[this.prop]) : this.items;
		},

		reversed(): boolean {
			return this.pagination.reversed;
		},

		isCompactMode(): boolean {
			return this.$store.state.device.postStyle === 'compact';
		},
	},

	methods: {
		updated(oldValue, newValue) {
			const i = this.notes.findIndex(n => n === oldValue);
			if (this.prop) {
				Vue.set(this.items[i], this.prop, newValue);
			} else {
				Vue.set(this.items, i, newValue);
			}
		},

		focus() {
			this.$refs.notes.focus();
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-notes {
	> .notes {
		-webkit-backdrop-filter: blur(4px);
		backdrop-filter: blur(4px);

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
