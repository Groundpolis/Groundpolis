<template>
<div class="mk-home" v-hotkey.global="keymap">
	<div class="new" v-if="queue > 0" :style="{ width: width + 'px' }"><button class="_buttonPrimary" @click="top()">{{ $t('newNoteRecived') }}</button></div>

	<div class="_section">
		<XTutorial v-if="$store.state.settings.tutorial != -1" class="tutorial _content _vMargin"/>
		<XPostForm v-if="$store.state.device.showFixedPostForm" class="post-form _panel _content _vMargin" fixed/>
		<XTimeline ref="tl"
			class="_content _vMargin"
			:key="src === 'list' ? `list:${list.id}` : src === 'antenna' ? `antenna:${antenna.id}` : src === 'channel' ? `channel:${channel.id}` : src"
			:src="src"
			:list="list ? list.id : null"
			:antenna="antenna ? antenna.id : null"
			:channel="channel ? channel.id : null"
			:sound="true"
			@before="before()"
			@after="after()"
			@queue="queueUpdated"
		/>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed, ComputedRef } from 'vue';
import { faAngleDown, faAngleUp, faHome, faShareAlt, faGlobe, faListUl, faSatellite, faSatelliteDish, faCircle, faEllipsisH, faPencilAlt, faBullhorn, faCat, faProjectDiagram, faCommentAlt, faAt } from '@fortawesome/free-solid-svg-icons';
import { faComments, faEnvelope } from '@fortawesome/free-regular-svg-icons';
import Progress from '@/scripts/loading';
import XTimeline from '@/components/timeline.vue';
import XPostForm from '@/components/post-form.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';

export default defineComponent({
	name: 'timeline',

	components: {
		XTimeline,
		XTutorial: defineAsyncComponent(() => import('./timeline.tutorial.vue')),
		XPostForm,
	},

	data() {
		return {
			src: 'home',
			list: null,
			antenna: null,
			channel: null,
			menuOpened: false,
			queue: 0,
			width: 0,
			announcements: [],
			hasUnreadAnnouncements: false,
			INFO: computed(() => {
				type Tab = {
					id: string,
					title?: string | null,
					tooltip?: string | null,
					icon?: any,
					onClick?: () => void,
					selected?: ComputedRef<boolean>,
					indicate?: ComputedRef<boolean>,
				};
				const tabs: Tab[] = [{
					id: 'home',
					title: null,
					tooltip: this.$t('_timelines.home'),
					icon: faHome,
					onClick: () => { this.src = 'home'; this.saveSrc(); },
					selected: computed(() => this.src === 'home'),
				}];

				const isMod = this.$store.state.i.isModerator || this.$store.state.i.isAdmin;
				const withLTL = !this.$store.state.instance.meta.disableLocalTimeline || isMod;
				const withGTL = !this.$store.state.instance.meta.disableGlobalTimeline || isMod;

				if (withLTL) {
					tabs.push({
						id: 'local',
						title: null,
						tooltip: this.$t('_timelines.local'),
						icon: faComments,
						onClick: () => { this.src = 'local'; this.saveSrc(); },
						selected: computed(() => this.src === 'local')
					});

					tabs.push({
						id: 'social',
						title: null,
						tooltip: this.$t('_timelines.social'),
						icon: faShareAlt,
						onClick: () => { this.src = 'social'; this.saveSrc(); },
						selected: computed(() => this.src === 'social')
					});
				}

				if (withGTL) {
					tabs.push({
						id: 'global',
						title: null,
						tooltip: this.$t('_timelines.global'),
						icon: faGlobe,
						onClick: () => { this.src = 'global'; this.saveSrc(); },
						selected: computed(() => this.src === 'global')
					});
				}

				tabs.push({
					id: 'other',
					title: null,
					icon: faEllipsisH,
					onClick: this.choose,
					indicate: computed(() => this.$store.state.i.hasUnreadAntenna || this.$store.state.i.hasUnreadChannel)
				});

				if (this.announcements.length > 0) {
					tabs.push({
						id: 'announcements',
						title: null,
						icon: faBullhorn,
						onClick: () => {
							os.popup(import('@/components/announcements-window.vue'), {
								announcements: this.announcements
							}, {
								read: ann => {
									this.announcements = this.announcements.map(a => {
										const newA = a;
										newA.isRead = newA.isRead || a.id === ann.id;
										return newA;
									});
									this.hasUnreadAnnouncements = this.announcements.some(a => !a.isRead);

									os.api('i/read-announcement', { announcementId: ann.id })
								},
							}, 'closed');
						},
						indicate: computed(() => this.hasUnreadAnnouncements)
					});
				};

				return {
					tabs,
					action: {
						icon: faPencilAlt,
						handler: () => os.post()
					}
				};
			}),
			faAngleDown, faAngleUp, faHome, faShareAlt, faGlobe, faComments, faListUl, faSatellite, faSatelliteDish, faCircle
		};
	},

	computed: {
		keymap(): any {
			return {
				't': this.focus
			};
		},

		meta() {
			return this.$store.state.instance.meta;
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

	mounted() {
		this.width = this.$el.offsetWidth;
	},

	async activated() {
		this.announcements = (await os.api('announcements', {
			limit: 100,
		}));
		this.hasUnreadAnnouncements = this.announcements.some(a => !a.isRead);
	},

	methods: {
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

		async choose(ev) {
			if (this.meta == null) return;

			const isMod = this.$store.state.i.isModerator || this.$store.state.i.isAdmin;
			const withCTL = !this.$store.state.instance.meta.disableCatTimeline || isMod;

			const antennaPromise = os.api('antennas/list').then((antennas: any[]) => antennas.length === 0 ? [] : [null, ...antennas.map(antenna => ({
				text: antenna.name,
				icon: faSatellite,
				indicate: antenna.hasUnreadNote,
				action: () => {
					this.antenna = antenna;
					this.src = 'antenna';
					this.saveSrc();
				}
			}))]);
			const listPromise = os.api('users/lists/list').then((lists: any[]) => lists.length === 0 ? [] : [null, ...lists.map(list => ({
				text: list.name,
				icon: faListUl,
				action: () => {
					this.list = list;
					this.src = 'list';
					this.saveSrc();
				}
			}))]);
			const channelPromise = os.api('channels/followed').then((channels: any[]) => channels.length === 0 ? [] : [null, ...channels.map(channel => ({
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
			}))]);

			os.modalMenu([
				(withCTL ? {
					text: this.$t('_timelines.cat'),
					icon: faCat,
					action: () => {
						this.src = 'cat';
						this.saveSrc();
					}
				} : undefined),
				{
					text: this.$t('_timelines.remoteFollowing'),
					icon: faProjectDiagram,
					action: () => {
						this.src = 'remoteFollowing';
						this.saveSrc();
					}
				},
				{
					text: this.$t('_timelines.followers'),
					icon: faCommentAlt,
					action: () => {
						this.src = 'followers';
						this.saveSrc();
					}
				},
				null,
				{
					text: this.$t('mentions'),
					icon: faAt,
					action: () => {
						this.src = 'mentions';
						this.saveSrc();
					}
				},
				{
					text: this.$t('directNotes'),
					icon: faEnvelope,
					action: () => {
						this.src = 'direct';
						this.saveSrc();
					}
				},
				antennaPromise,
				listPromise,
				channelPromise,
				], ev.currentTarget || ev.target);
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
		}
	}
});
</script>

<style lang="scss" scoped>
.mk-home {
	> .new {
		position: fixed;
		z-index: 1000;

		> button {
			display: block;
			margin: var(--margin) auto 0 auto;
			padding: 8px 16px;
			border-radius: 32px;
		}
	}

	> ._section {

	}
}
</style>
