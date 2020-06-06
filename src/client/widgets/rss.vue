<template>
<div>
	<mk-container :show-header="!props.compact">
		<template #header><fa :icon="faRssSquare"/>RSS</template>
		<template #func><button class="_button" @click="setting"><fa :icon="faCog"/></button></template>

		<div class="ekmkgxbj">
			<mk-loading v-if="fetching"/>
			<div class="feed" v-else>
				<div class="item" v-for="item in items" :key="item.link">
					<a :href="item.link" rel="nofollow noopener" target="_blank" :title="item.title">{{ item.title }}</a>
					<button class="share" @click="share(item)">
						<fa :icon="faShareSquare" />
					</button>
				</div>
			</div>
		</div>
	</mk-container>
</div>
</template>

<script lang="ts">
import { faRssSquare, faCog, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import MkContainer from '../components/ui/container.vue';
import define from './define';

export default define({
	name: 'rss',
	props: () => ({
		compact: false,
		url: 'http://feeds.afpbb.com/rss/afpbb/afpbbnews'
	})
}).extend({
	components: {
		MkContainer
	},
	data() {
		return {
			items: [],
			fetching: true,
			clock: null,
			faRssSquare, faCog, faShareSquare
		};
	},
	mounted() {
		this.fetch();
		this.clock = setInterval(this.fetch, 60000);
	},
	beforeDestroy() {
		clearInterval(this.clock);
	},
	methods: {
		func() {
			this.props.compact = !this.props.compact;
			this.save();
		},
		fetch() {
			fetch(`https://api.rss2json.com/v1/api.json?rss_url=${this.props.url}`, {
			}).then(res => {
				res.json().then(feed => {
					this.items = feed.items;
					this.fetching = false;
				});
			});
		},
		setting() {
			this.$root.dialog({
				title: 'URL',
				input: {
					type: 'url',
					default: this.props.url
				}
			}).then(({ canceled, result: url }) => {
				if (canceled) return;
				this.props.url = url;
				this.save();
				this.fetch();
			});
		},
		share(item: { title: string, link: string, description: string, content: string }) {
			const desc = item.description || item.content;
			const initialText = desc ? `${item.title}\n\n${desc}\n\n${item.link}` : `${item.title}\n\n${item.link}`;
			this.$root.post({ initialText, instant: true });
		}
	}
});
</script>

<style lang="scss" scoped>
.ekmkgxbj {
	> .feed {
		padding: 0;
		font-size: 0.9em;

		.item {
			display: grid;
			grid-template-columns: 1fr 32px;

			> a {
				display: block;
				padding: 8px 16px;
				color: var(--text);
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;

				&:nth-child(even) {
					background: rgba(#000, 0.05);
				}
			}

			.share {
				display: block;
				width: 32px;
				height: 100%;
				background: transparent;
				font-size: 16px;
				border: 0px solid transparent;
				color: var(--fg);
				cursor: pointer;
				outline: none;
				&:hover {
					opacity: 0.7;
				}
			}
		}
	}
}
</style>
