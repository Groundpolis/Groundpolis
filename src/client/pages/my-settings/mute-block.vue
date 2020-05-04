<template>
<section class="rrfwjxfl _card">
	<div class="_title"><fa :icon="faBan"/> {{ $t('muteAndBlock') }}</div>
	<div class="_content">
		<span>{{ $t('mutedUsers') }}</span>
		<mk-pagination :pagination="mutingPagination" class="muting">
			<template #empty><span>{{ $t('noUsers') }}</span></template>
			<template #default="{items}">
				<div class="user" v-for="(mute, i) in items" :key="mute.id">
					<router-link class="name" :to="mute.mutee | userPage">
						<mk-acct :user="mute.mutee"/>
					</router-link>
				</div>
			</template>
		</mk-pagination>
	</div>
	<div class="_content">
		<span>{{ $t('blockedUsers') }}</span>
		<mk-pagination :pagination="blockingPagination" class="blocking">
			<template #empty><span>{{ $t('noUsers') }}</span></template>
			<template #default="{items}">
				<div class="user" v-for="(block, i) in items" :key="block.id">
					<router-link class="name" :to="block.blockee | userPage">
						<mk-acct :user="block.blockee"/>
					</router-link>
				</div>
			</template>
		</mk-pagination>
	</div>
	<div class="_content">
		<span>{{ $t('mutedWords') }}</span>

		<mk-textarea v-model="mutedWordsString">
			<span>{{ $t('mutedWords') }}</span>
			<template #desc>{{ $t('_profile.mutedWordsDescription') }}</template>
		</mk-textarea>
		<mk-button @click="saveMutedWords()" primary inline :disabled="!changedMutedWords"><fa :icon="faSave"/> {{ $t('save') }}</mk-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import MkButton from '../../components/ui/button.vue';
import MkTextarea from '../../components/ui/textarea.vue';
import MkPagination from '../../components/ui/pagination.vue';
import i18n from '../../i18n';

export default Vue.extend({
	i18n,

	components: {
		MkPagination,
		MkButton,
		MkTextarea,
	},

	data() {
		return {
			mutingPagination: {
				endpoint: 'mute/list',
				limit: 10,
			},
			blockingPagination: {
				endpoint: 'blocking/list',
				limit: 10,
			},
			mutedWordsString: this.$store.state.settings.mutedWords.map(words => words.join(' ')).join('\n'),
			changedMutedWords: false,
			faBan, faSave,
		}
	},

	watch: {
		mutedWordsString() {
			this.changedMutedWords = true;
		}
	},

	methods: {
		saveMutedWords() {
			this.$store.dispatch('settings/set', { key: 'mutedWords', value: this.mutedWordsString.split('\n').map((line: string) => line.split(' ').filter(x => x != '')) })
			this.changedMutedWords = false;

			this.$root.dialog({
				type: 'success',
				iconOnly: true, autoClose: true
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.rrfwjxfl {
	> ._content {
		max-height: 350px;
		overflow: auto;

		> .muting,
		> .blocking {
			> .empty {
				opacity: 0.5 !important;
			}
		}
	}
}
</style>
