<template>
<div class="mk-home" v-hotkey.global="keymap">
	<template v-if="showTitle">
		<portal to="header">
			<div class="tabs">
				<button class="_button tab" v-for="(item, i) in tabItems" :key="i" :class="{ active: item.src === src }" v-tooltip="item.text" @click="item.action">
					<fa :icon="item.icon" />
				</button>
				<button class="_button tab" @click="choose">
					<fa :icon="faEllipsisH" />
					<i><fa v-if="$store.state.i.hasUnreadAntenna" :icon="faCircle"/></i>
				</button>
				<div class="_button tab active" v-tooltip="timelineTitle" v-if="!tabItems.map(i => i.src).includes(src)">
					<fa :icon="getIconOfTimeline(src)"/>
				</div>
				<button class="_button tab" v-tooltip="$t('announcements')" v-if="newAnnouncementUI && announcements && announcements.length > 0" @click="openAnnouncement">
					<fa :icon="faBullhorn" />
					<i><fa v-if="unreadAnnouncements && unreadAnnouncements.length > 0" :icon="faCircle"/></i>
				</button>
			</div>
		</portal>
	</template>

	<div class="new" v-if="queue > 0" :style="{ width: width + 'px' }"><button class="_buttonPrimary" @click="top()">{{ $t('newNoteRecived') }}</button></div>

	<x-tutorial class="tutorial" v-if="$store.state.settings.tutorial != -1"/>
	<section class="_card announcements" v-else-if="!newAnnouncementUI && $store.getters.isSignedIn && announcements.length > 0">
		<div class="_title">{{ currentAnnouncement.title }}</div>
		<div class="_content">
			<mfm :text="currentAnnouncement.text"/>
			<img v-if="currentAnnouncement.imageUrl" :src="currentAnnouncement.imageUrl" alt=""/>
		</div>
		<div class="_footer navigation">
			<button class="arrow" @click="currentAnnouncementIndex--" :disabled="currentAnnouncementIndex == 0">
				<fa :icon="faChevronLeft"/>
			</button>
			<span>{{ currentAnnouncementIndex + 1 }} / {{ announcements.length }}</span>
			<button class="arrow" @click="currentAnnouncementIndex++" :disabled="currentAnnouncementIndex == announcements.length - 1">
				<fa :icon="faChevronRight"/>
			</button>
			<mk-button class="ok" @click="read(currentAnnouncement)" primary><fa :icon="faCheck"/> {{ $t('gotIt') }}</mk-button>
		</div>
	</section>
	
	<x-post-form class="post-form _panel" fixed v-if="$store.state.device.showFixedPostForm"/>
	<x-timeline ref="tl" :key="src === 'list' ? `list:${list.id}` : src === 'antenna' ? `antenna:${antenna.id}` : src === 'channel' ? `channel:${channel.id}` : src" :src="src" :list="list ? list.id : null" :antenna="antenna ? antenna.id : null" :channel="channel ? channel.id : null" :sound="true" @before="before()" @after="after()" @queue="queueUpdated"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faAngleDown, faAngleUp, faHome, faListUl, faBroadcastTower, faCircle, faChevronLeft, faChevronRight, faCheck, faEllipsisH, faSatelliteDish, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import Progress from '../scripts/loading';
import { getIconOfTimeline } from '../scripts/get-icon-of-timeline';
import XTimeline from '../components/timeline.vue';
import MkButton from '../components/ui/button.vue';
import XPostForm from '../components/post-form.vue';
import { deckmode } from '../config';
import { scroll } from '../scripts/scroll';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('timeline') as string
		};
	},

	components: {
		XTimeline,
		MkButton,
		XPostForm,
		XTutorial: () => import('./index.home.tutorial.vue').then(m => m.default),
	},

	props: {
		showTitle: {
			type: Boolean,
			required: true
		}
	},

	data() {
		return {
			src: 'home',
			list: null,
			antenna: null,
			channel: null,
			menuOpened: false,
			announcements: [] as any[],
			unreadAnnouncements: [] as any[],
			queue: 0,
			width: 0,
			currentAnnouncementIndex: 0,
			faAngleDown, faAngleUp, faHome, faCircle, faChevronLeft, faChevronRight, faCheck, faEllipsisH, faSatelliteDish, faBullhorn
		};
	},

	computed: {
		keymap(): any {
			return {
				't': this.focus
			};
		},
		currentAnnouncement() {
			if (this.announcements.length > 0) {
				if (this.currentAnnouncementIndex < 0)
					this.currentAnnouncementIndex = 0;
				if (this.currentAnnouncementIndex >= this.announcements.length)
					this.currentAnnouncementIndex = this.announcements.length - 1;
				
				return this.announcements[this.currentAnnouncementIndex];
			}
			return null;
		},
		deckMode() { return deckmode; },
		tabItems() {
			return [
				this.genItem('home'),
				this.ifLTL(this.genItem('local')),
				this.ifLTL(this.genItem('social')),
				this.ifGTL(this.genItem('global')),
			].filter(it => it !== undefined);
		},

		meta() {
			return this.$store.state.instance.meta;
		},

		timelineTitle() {
			return 	this.src === 'list' ?  this.list.name : 
							this.src === 'antenna' ? this.antenna.name : 
							this.src === 'mentions' ? this.$t('mentions') :
							this.src === 'direct' ? this.$t('directNotes') :
							this.src === 'channel' ? this.channel.name :
							this.$t('_timelines.' + this.src);
		},

		newAnnouncementUI() {
			return this.$store.state.device.newAnnouncementUI;
		},
		
	},

	watch: {
		src() {
			this.showNav = false;
		},
		list(x) {
			this.showNav = false;
			if (x != null) this.antenna = null;
			if (x != null) this.channel = null;
		},
		antenna(x) {
			this.showNav = false;
			if (x != null) this.list = null;
			if (x != null) this.channel = null;
		},
		channel(x) {
			this.showNav = false;
			if (x != null) this.antenna = null;
			if (x != null) this.list = null;
		},
	},

	created() {
		this.src = this.$store.state.deviceUser.tl.src;
		if (this.src === 'list') {
			this.list = this.$store.state.deviceUser.tl.arg;
		} else if (this.src === 'antenna') {
			this.antenna = this.$store.state.deviceUser.tl.arg;
		} else if (this.src === 'channel') {
			this.channel = this.$store.state.deviceUser.tl.arg;
		}
	},

	activated() {
		this.$root.api('announcements', { limit: 100, withUnreads: !this.newAnnouncementUI }).then((a: any) => {
			this.announcements = a;
			this.unreadAnnouncements = a.filter(an => !an.isRead);
		});
		
	},

	mounted() {
		this.width = this.$el.offsetWidth;
	},

	methods: {
		getIconOfTimeline, 
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		queueUpdated(q) {
			if (this.$el.offsetWidth !== 0) this.width = this.$el.offsetWidth;
			this.queue = q;
		},

		top() {
			scroll(this.$el, 0);
		},

		genItem(src: string, name?: string) {
			return {
				text: name || this.$t('_timelines.' + src),
				icon: getIconOfTimeline(src),
				src,
				action: () => { this.setSrc(src); }
			};
		},

		ifLTL<T>(item: T) : (T | undefined) {
			return this.meta.disableLocalTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : item;
		},

		ifGTL<T>(item: T) : (T | undefined) {
			return this.meta.disabledGlobalTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : item;
		},

		ifCTL<T>(item: T) : (T | undefined) {
			return this.meta.disableCatTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : item;
		},

		async choose(ev) {
			if (this.meta == null) return;
			this.menuOpened = true;
			const [antennas, lists, channels] = await Promise.all([
				this.$root.api('antennas/list'),
				this.$root.api('users/lists/list'),
				this.$root.api('channels/followed'),
			]);
			const antennaItems = antennas.map(antenna => ({
				text: antenna.name,
				icon: faBroadcastTower,
				indicate: antenna.hasUnreadNote,
				action: () => {
					this.antenna = antenna;
					this.setSrc('antenna');
				}
			}));
			const listItems = lists.map(list => ({
				text: list.name,
				icon: faListUl,
				action: () => {
					this.list = list;
					this.setSrc('list');
				}
			}));
			const channelItems = channels.map(channel => ({
				text: channel.name,
				icon: faSatelliteDish,
				indicate: channel.hasUnreadNote,
				action: () => {
					// NOTE: チャンネルタイムラインをこのコンポーネントで表示するようにすると投稿フォームはどうするかなどの問題が生じるのでとりあえずページ遷移で
					//this.channel = channel;
					//this.src = 'channel';
					//this.saveSrc();
					this.$router.push(`/channels/${channel.id}`);
				}
			}));
			
			this.$root.menu({
				items: [
					this.ifCTL(this.genItem('cat')),
					this.genItem('remoteFollowing'),
					this.genItem('followers'),
					antennaItems.length > 0 ? null : undefined,
					...antennaItems,
					listItems.length > 0 ? null : undefined,
					...listItems,
					channelItems.length > 0 ? null : undefined,
					...channelItems,
					null,
					this.genItem('mentions', this.$t('mentions').toString()),
					this.genItem('direct', this.$t('directNotes').toString()),
				],
				fixed: true,
				noCenter: true,
				source: ev.currentTarget || ev.target
			}).then(() => {
				this.menuOpened = false;
			});
		},

		setSrc(src: string) {
			this.src = src;
			this.saveSrc();
		},

		saveSrc() {
			this.$store.commit('deviceUser/setTl', {
				src: this.src,
				arg:
					this.src === 'list' ? this.list :
					this.src === 'antenna' ? this.antenna :
					this.channel
			});
		},

		focus() {
			(this.$refs.tl as any).focus();
		},

		read(announcement: any) {
			if (this.newAnnouncementUI) {
				this.unreadAnnouncements = this.unreadAnnouncements.filter(a => a != announcement);
			} else {
				this.announcements = this.announcements.filter(a => a != announcement);
			}
			this.$root.api('i/read-announcement', { announcementId: announcement.id });
		},
		
		async openAnnouncement() {
			this.$root.new(await import('../components/announcements-window.vue').then(m => m.default), {
				announcements: this.announcements,
			}).$on('read', (announcement) => this.read(announcement));
		},
	}
});
</script>

<style lang="scss" scoped>

.announcements {
	margin-bottom: var(--margin);

	> .navigation {
		display: flex;
		flex-direction: row;
		align-items: baseline;
		font-size: 18px;

		> .arrow {
			color: var(--fg);
			background: none;
			border: none;
			font-size: inherit;

			&:disabled {
				opacity: 0.6;
			}
		}

		> .ok {
			margin-left: auto;
		}
	}
}

.post-form {
	margin-bottom: var(--margin);
}

.tabs {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	> .tab {
		display: block;
		position: relative;
		padding: 0 16px;
		height: 100%;

		> i {
			position: absolute;
			top: initial;
			right: 8px;
			top: 8px;
			color: var(--indicator);
			font-size: 12px;
			animation: blink 1s infinite;
		}

		&.active {
			color: var(--accent);
			border-bottom: 2px solid var(--accent);
		}
	}
}

.mk-home {
	> .new {
		position: fixed;
		z-index: 1000;

		> button {
			display: block;
			margin: 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> .tutorial {
		margin-bottom: var(--margin);
	}

	> .post-form {
		position: relative;
		margin-bottom: var(--margin);
	}
}
</style>
