<template>
<div class="root naked">
	<portal to="icon"><fa :icon="faStar"/></portal>
	<portal to="title">{{ $t('_tanabata.title') }}</portal>

	<div class="_panel info">
		<template v-if="isTanabata">
			<p>{{ $t('_tanabata.info1') }}</p>
			<p>{{ $t('_tanabata.info2') }}</p>
		</template>
		<template v-else>
			<p>{{ $t('_tanabata.end') }}</p>
		</template>
	</div>

	<div class="bamboo" />

	<x-form v-if="isTanabata && myTanzaku && !myTanzaku.id" class="post-form _panel" ref="form" @posted="posted"/>
	<x-tanzaku class="tanzaku" v-else-if="myTanzaku && myTanzaku.id" :note="myTanzaku" @deleted="updateMyTanzaku"/>

	<mk-pagination :pagination="pagination" class="tanzakus" ref="tl" @before="before" @after="after">
		<template #default="{items}">
			<x-tanzaku class="tanzaku" v-for="note in items" :key="note.id" :note="note" />
		</template>
	</mk-pagination>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import XTanzaku from '../components/tanzaku.vue';
import XForm from '../components/tanzaku-form.vue';
import MkPagination from '../components/ui/pagination.vue';
import { isTanabata } from '../../misc/is-tanabata';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('_tanabata.title') as string
		};
	},
	components: {
		XTanzaku,
		XForm,
		MkPagination
	},
	data() {
		return {
			pagination: {
				endpoint: 'notes/tanzakus',
				limit: 10,
			},
			myTanzaku: null,
			faStar
		};
	},
	computed: {
		isTanabata() {
			return isTanabata();
		}
	},
	mounted() {
		this.updateMyTanzaku();
	},
	methods: {
		before() {
			Progress.start();
		},
		after() {
			Progress.done();
		},
		posted() {
			this.updateMyTanzaku();
			
			this.$root.dialog({
				type: 'info',
				text: this.$t('_tanabata.posted')
			});
		},
		async updateMyTanzaku() {
			if (!this.$store.getters.isSignedIn) {
				this.myTanzaku = null;
				return;
			}
			this.myTanzaku = await this.$root.api('i/tanzaku');
		}
	}
});
</script>

<style lang="scss" scoped>
	.tanzakus > .tanzaku {
		margin-top: var(--margin);
	}
	
	.info {
		padding: 8px 16px;
		margin-bottom: 16px;
	}

	.tanzaku {
		margin-left: 8px;
		margin-right: 8px;
		border-radius: 2px;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
	}

	.root {
		position: relative;

		> .bamboo {
			position: fixed;
			top: 0;
			bottom: 0;
			z-index: -500;
			width: 16px;
			background: linear-gradient(90deg, #81C784, #2E7D32);
		}
	}
</style>
