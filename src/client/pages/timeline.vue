<template>
<div class="mk-home" v-hotkey.global="keymap">
	<div class="new" v-if="queue > 0" :style="{ width: width + 'px' }"><button class="_buttonPrimary" @click="top()">{{ $ts.newNoteRecived }}</button></div>

	<div class="_section">
		<XTutorial v-if="$store.reactiveState.tutorial.value != -1" class="tutorial _content _vMargin"/>
		<template v-if="$store.reactiveState.showFixedPostForm.value">
			<XPostFormV2 v-if="$store.reactiveState.tryNewPostForm.value" class="post-form _content _vMargin" fixed />
			<XPostForm v-else class="post-form _panel _content _vMargin" fixed/>
		</template>
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
import { faAngleDown, faAngleUp, faHome, faShareAlt, faGlobe, faListUl, faSatellite, faSatelliteDish, faCircle, faEllipsisH, faPencilAlt, faBullhorn, faWrench } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-regular-svg-icons';
import Progress from '@/scripts/loading';
import XTimeline from '@/components/timeline.vue';
import XPostForm from '@/components/post-form.vue';
import XPostFormV2 from '@/components/post-form-v2.vue';
import { scroll } from '@/scripts/scroll';
import * as os from '@/os';
import { timelineMenuItems, timelineMenuMap } from '../menus/timeline';
export default defineComponent({
	name: 'timeline',
	components: {
		XTimeline,
		XTutorial: defineAsyncComponent(() => import('./timeline.tutorial.vue')),
		XPostForm,
		XPostFormV2,
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
					selected?: ComputedRef<boolean> | boolean,
					indicate?: ComputedRef<boolean> | boolean,
				};
				const tabs: Tab[] = [];
				for (const item of (this.$store.state.timelineTabItems as []).map(src => timelineMenuItems.find(it => it.src === src))) {
					if (!item) continue;
					if (item.show && !item.show()) continue;
					tabs.push({
						id: item.src,
						title: null,
						tooltip: item.name,
						icon: item.icon,
						onClick: () => { this.src = item.src; this.saveSrc(); },
						selected: computed(() => this.src === item.src),
					});
				}
				if (!this.$store.state.timelineTabItems.includes(this.src)) {
					tabs.push({
						id: this.src,
						title: null,
						icon: this.src === 'antenna' ? faSatellite : this.src === 'list' ? faListUl : timelineMenuMap[this.src] ? timelineMenuMap[this.src].icon : null,
						selected: true,
					});
				}
				tabs.push({
					id: 'other',
					title: null,
					icon: faEllipsisH,
					onClick: this.choose,
					indicate: computed(() => this.$i.hasUnreadAntenna || this.$i.hasUnreadChannel)
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
					title: this.$ts.timeline,
					tabs,
					action: {
						icon: faPencilAlt,
						handler: () => os.post(),
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
			return this.$instance;
		},
	},
	watch: {
		src() {
			this.queue = 0;
			this.showNav = false;
			this.top();
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
		this.src = this.$store.state.tl.src;
		if (this.src === 'list') {
			this.list = this.$store.state.tl.arg;
		} else if (this.src === 'antenna') {
			this.antenna = this.$store.state.tl.arg;
		} else if (this.src === 'channel') {
			this.channel = this.$store.state.tl.arg;
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
			const timelines = timelineMenuItems
				.filter(it => !(this.$store.state.timelineTabItems as string[]).includes(it.src))
				.filter(it => !it.show || it.show())
				.map(it => ({
					text: it.name,
					icon: it.icon,
					action: () => { this.src = it.src; this.saveSrc(); },
				})) as any[];
			timelines.push(null);
			timelines.push({
				type: 'link',
				text: this.$ts.customize,
				icon: faWrench,
				to: '/settings/timeline',
			});
			os.modalMenu([
				timelines,
				antennaPromise,
				listPromise,
				channelPromise,
				], ev.currentTarget || ev.target);
		},
		saveSrc() {
			this.$store.set('tl', {
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
