<template>
<mk-container :show-header="props.showHeader" :style="`height: ${props.height}px;`" :scrollable="true">
	<template #header>
		<button @click="choose" class="_button">
			<fa :icon="getIconOfTimeline(props.src)"/>
			<span style="margin-left: 8px;">{{ timelineTitle }}</span>
			<fa :icon="menuOpened ? faAngleUp : faAngleDown" style="margin-left: 8px;"/>
		</button>
	</template>

	<div>
		<x-timeline :key="props.src === 'list' ? `list:${props.list.id}` : props.src === 'antenna' ? `antenna:${props.antenna.id}` : props.src" :src="props.src" :list="props.list ? props.list.id : null" :antenna="props.antenna ? props.antenna.id : null"/>
	</div>
</mk-container>
</template>

<script lang="ts">
import { faAngleDown, faAngleUp, faHome, faShareAlt, faGlobe, faListUl, faSatellite, faCat, faAt, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { faComments, faEnvelope, faCommentAlt } from '@fortawesome/free-regular-svg-icons';
import { getIconOfTimeline } from '../scripts/get-icon-of-timeline';
import MkContainer from '../components/ui/container.vue';
import XTimeline from '../components/timeline.vue';
import define from './define';

export default define({
	name: 'timeline',
	props: () => ({
		showHeader: {
			type: 'boolean',
			default: true,
		},
		height: {
			type: 'number',
			default: 300,
		},
		src: {
			type: 'string',
			default: 'home',
			hidden: true,
		},
		list: {
			type: 'object',
			default: null,
			hidden: true,
		},
	})
}).extend({
	components: {
		MkContainer,
		XTimeline,
	},

	data() {
		return {
			menuOpened: false,
			faAngleDown, faAngleUp, faHome, faShareAlt, faGlobe, faComments, faListUl, faSatellite, faCat, faAt, faEnvelope, faProjectDiagram, faCommentAlt
		};
	},

	computed: {
		meta() {
			return this.$store.state.instance.meta;
		},

		timelineTitle() {
			return 	this.props.src === 'list' ?  this.props.list.name : 
							this.props.src === 'antenna' ? this.props.antenna.name : 
							this.props.src === 'mentions' ? this.$t('mentions') :
							this.props.src === 'direct' ? this.$t('directNotes') :
							this.$t('_timelines.' + this.props.src);
		}
	},

	methods: {
		getIconOfTimeline,

		async choose(ev) {
			if (this.meta == null) return;
			this.menuOpened = true;
			const [antennas, lists] = await Promise.all([
				this.$root.api('antennas/list'),
				this.$root.api('users/lists/list')
			]);
			const antennaItems = antennas.map(antenna => ({
				text: antenna.name,
				icon: faSatellite,
				action: () => {
					this.props.antenna = antenna;
					this.setSrc('antenna');
				}
			}));
			const listItems = lists.map(list => ({
				text: list.name,
				icon: faListUl,
				action: () => {
					this.props.list = list;
					this.setSrc('list');
				}
			}));
			this.$root.menu({
				items: [{
					text: this.$t('_timelines.home'),
					icon: faHome,
					action: () => { this.setSrc('home') }
				}, this.meta.disableLocalTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : {
					text: this.$t('_timelines.local'),
					icon: faComments,
					action: () => { this.setSrc('local') }
				}, this.meta.disableLocalTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : {
					text: this.$t('_timelines.social'),
					icon: faShareAlt,
					action: () => { this.setSrc('social') }
				}, this.meta.disableGlobalTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : {
					text: this.$t('_timelines.global'),
					icon: faGlobe,
					action: () => { this.setSrc('global') }
				}, this.meta.disableCatTimeline && !this.$store.state.i.isModerator && !this.$store.state.i.isAdmin ? undefined : {
					text: this.$t('_timelines.cat'),
					icon: faCat,
					action: () => { this.setSrc('cat') }
				}, {
					text: this.$t('_timelines.remoteFollowing'),
					icon: faProjectDiagram,
					action: () => { this.setSrc('remoteFollowing') }
				}, {
					text: this.$t('_timelines.followers'),
					icon: faCommentAlt,
					action: () => { this.setSrc('followers') }
				}, antennaItems.length > 0 ? null : undefined, ...antennaItems, listItems.length > 0 ? null : undefined, ...listItems, null, {
					text: this.$t('mentions'),
					icon: faAt,
					action: () => { this.setSrc('mentions') }
				}, {
					text: this.$t('directNotes'),
					icon: faEnvelope,
					action: () => { this.setSrc('direct') }
				}],
				fixed: true,
				noCenter: true,
				source: ev.currentTarget || ev.target
			}).then(() => {
				this.menuOpened = false;
			});
		},

		setSrc(src) {
			this.props.src = src;
			this.save();
		},
	}
});
</script>
