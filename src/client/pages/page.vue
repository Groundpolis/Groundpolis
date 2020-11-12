<template>
<div class="xcukqgmh" v-if="page" :key="page.id">
	<div class="_section main">
		<div class="_content">
			<div class="banner">
				<img :src="page.eyeCatchingImage.url" v-if="page.eyeCatchingImageId"/>
			</div>
			<div>
				<XPage :page="page"/>
				<small style="display: block; opacity: 0.7; margin-top: 1em;">@{{ page.user.username }}</small>
			</div>
		</div>
	</div>
	<div class="_section like" v-if="page.likedCount > 0">
		<div class="_content count">
			<Fa :icon="faHeartS"/>
			{{ page.likedCount }}
		</div>
	</div>
	<div class="_section links">
		<div class="_content">
			<MkA :to="`./${page.name}/view-source`" class="link">{{ $t('_pages.viewSource') }}</MkA>
			<template v-if="$store.getters.isSignedIn && $store.state.i.id === page.userId">
				<MkA :to="`/my/pages/edit/${page.id}`" class="link">{{ $t('_pages.editThisPage') }}</MkA>
			</template>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { faBookmark as faBookmarkS, faEdit, faHeart as faHeartS } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartR, faBookmark as faBookmarkR } from '@fortawesome/free-regular-svg-icons';
import XPage from '@/components/page/page.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		XPage
	},

	props: {
		pageName: {
			type: String,
			required: true
		},
		username: {
			type: String,
			required: true
		},
	},

	data() {
		return {
			INFO: computed(() => this.page ? {
				title: computed(() => this.page.title || this.page.name),
				avatar: this.page.user,
				action: computed(() => this.page.user.id === this.$store.state.i.id ? {
					icon: this.$store.state.i.pinnedPageId === this.page.id ? faBookmarkS : faBookmarkR,
					handler: () => this.pin(this.$store.state.i.pinnedPageId !== this.page.id),
				} : {
					icon: this.page.isLiked ? faHeartS : faHeartR,
					handler: this.page.isLiked ? this.unlike : this.like,
				}),
			} : null),
			page: null,
			faHeartS, faHeartR
		};
	},

	computed: {
		path(): string {
			return this.username + '/' + this.pageName;
		}
	},

	watch: {
		path() {
			this.fetch();
		}
	},

	created() {
		this.fetch();
	},

	methods: {
		fetch() {
			os.api('pages/show', {
				name: this.pageName,
				username: this.username,
			}).then(page => {
				this.page = page;
			});
		},

		like() {
			os.api('pages/like', {
				pageId: this.page.id,
			}).then(() => {
				this.page.isLiked = true;
				this.page.likedCount++;
			});
		},

		unlike() {
			os.api('pages/unlike', {
				pageId: this.page.id,
			}).then(() => {
				this.page.isLiked = false;
				this.page.likedCount--;
			});
		},

		pin(pin) {
			os.apiWithDialog('i/update', {
				pinnedPageId: pin ? this.page.id : null,
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.xcukqgmh {
	> .main {
		> ._content {
			> .banner {
				> img {
					display: block;
					width: 100%;
					height: 120px;
					object-fit: cover;
				}
			}
		}
	}

	> .links {
		> ._content {
			> .link {
				margin-right: 0.75em;
			}
		}
	}
}
</style>
