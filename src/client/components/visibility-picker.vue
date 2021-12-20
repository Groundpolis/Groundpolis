<template>
<MkModal ref="modal" :src="src" @click="$refs.modal.close()" @closed="$emit('closed')" transparent>
	<div class="gqyayizv _popup">
		<button class="_button" @click="choose('public')" :class="{ active: v == 'public' }" data-index="1" key="public">
			<div><VisibilityIcon visibility="public" :localOnly="localOnly" :remoteFollowersOnly="remoteFollowersOnly" /></div>
			<div>
				<span>{{ $ts._visibility.public }}</span>
				<span>{{ $ts._visibility.publicDescription }}</span>
			</div>
		</button>
		<button class="_button" @click="choose('home')" :class="{ active: v == 'home' }" data-index="2" key="home">
			<div><VisibilityIcon visibility="home" :localOnly="localOnly" :remoteFollowersOnly="remoteFollowersOnly" /></div>
			<div>
				<span>{{ $ts._visibility.home }}</span>
				<span>{{ $ts._visibility.homeDescription }}</span>
			</div>
		</button>
		<button :disabled="remoteFollowersOnly" class="_button" @click="choose('followers')" :class="{ active: v == 'followers' }" data-index="3" key="followers">
			<div><VisibilityIcon visibility="followers" :localOnly="localOnly" /></div>
			<div>
				<span>{{ $ts._visibility.followers }}</span>
				<span>{{ $ts._visibility.followersDescription }}</span>
			</div>
		</button>
		<button :disabled="localOnly || remoteFollowersOnly" class="_button" @click="choose('specified')" :class="{ active: v == 'specified' }" data-index="4" key="specified">
			<div><VisibilityIcon visibility="specified" /></div>
			<div>
				<span>{{ $ts._visibility.specified }}</span>
				<span>{{ $ts._visibility.specifiedDescription }}</span>
			</div>
		</button>
		<button :disabled="localOnly || remoteFollowersOnly" class="_button" @click="choose('users')" :class="{ active: v == 'users' }" data-index="5" key="users">
			<div><VisibilityIcon visibility="users" /></div>
			<div>
				<span>{{ $ts._visibility.users }}</span>
				<span>{{ $ts._visibility.usersDescription }}</span>
			</div>
		</button>
		<div class="divider"></div>
		<button class="_button localOnly" @click="localOnly = !localOnly" :class="{ active: localOnly }" :disabled="isDisabledLocalOnly" data-index="5" key="localOnly">
			<div><Fa :icon="faHeart"/></div>
			<div>
				<span>{{ $ts._visibility.localOnly }}</span>
				<span>{{ $ts._visibility.localOnlyDescription }}</span>
			</div>
			<div><Fa :icon="localOnly ? faToggleOn : faToggleOff" :key="localOnly"/></div>
		</button>
		<button class="_button remoteFollowersOnly" @click="remoteFollowersOnly = !remoteFollowersOnly" :class="{ active: remoteFollowersOnly }" :disabled="isDisabledRemoteFollowersOnly" data-index="7" key="remoteFollowersOnly">
			<div><Fa :icon="faHeartbeat"/></div>
			<div>
				<span>{{ $ts._visibility.remoteFollowersOnly }}</span>
				<span>{{ $ts._visibility.remoteFollowersOnlyDescription }}</span>
			</div>
			<div><Fa :icon="remoteFollowersOnly ? faToggleOn : faToggleOff" :key="remoteFollowersOnly"/></div>
		</button>
	</div>
</MkModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faHeart, faHeartbeat, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import MkModal from '@/components/ui/modal.vue';
import VisibilityIcon from './visibility-icon.vue';
import { NoteVisibility } from '@/../types';

const localOnlyBlacklist: NoteVisibility[] = [
	'specified',
	'users'
];

const remoteFollowersOnlyBlacklist: NoteVisibility[] = [
	'followers',
	'specified',
	'users'
];

export default defineComponent({
	components: {
		MkModal,
		VisibilityIcon,
	},
	props: {
		currentVisibility: {
			type: String,
			required: true
		},
		currentLocalOnly: {
			type: Boolean,
			required: true
		},
		src: {
			required: false
		},
		currentRemoteFollowersOnly: {
			type: Boolean,
			required: false
		},
	},
	emits: ['change-visibility', 'change-local-only', 'change-remote-followers-only', 'closed'],
	data() {
		return {
			v: this.currentVisibility,
			localOnly: this.currentLocalOnly,
			remoteFollowersOnly: this.currentRemoteFollowersOnly,
			faHeart, faHeartbeat, faToggleOn, faToggleOff
		}
	},
	computed: {
		isDisabledLocalOnly() {
			return localOnlyBlacklist.includes(this.v);
		},
		isDisabledRemoteFollowersOnly() {
			return remoteFollowersOnlyBlacklist.includes(this.v);
		}
	},
	watch: {
		localOnly() {
			this.$emit('change-local-only', this.localOnly);
			if (this.localOnly && this.remoteFollowersOnly) {
				this.remoteFollowersOnly = false;
				this.$emit('change-remote-followers-only', this.remoteFollowersOnly);
			}
		},
		remoteFollowersOnly() {
			this.$emit('change-remote-followers-only', this.remoteFollowersOnly);
			if (this.remoteFollowersOnly && this.localOnly) {
				this.localOnly = false;
				this.$emit('change-local-only', this.localOnly);
			}
		}
	},
	methods: {
		choose(visibility: string) {
			this.v = visibility;
			this.$emit('change-visibility', visibility);
			this.$nextTick(() => {
				this.$refs.modal.close();
			});
		},
	}
});
</script>

<style lang="scss" scoped>
.gqyayizv {
	width: 240px;
	padding: 8px 0;

	> .divider {
		margin: 8px 0;
		border-top: solid 1px var(--divider);
	}

	> button {
		display: flex;
		padding: 8px 14px;
		font-size: 12px;
		text-align: left;
		width: 100%;
		box-sizing: border-box;

		&:hover {
			background: rgba(0, 0, 0, 0.05);
		}

		&:active {
			background: rgba(0, 0, 0, 0.1);
		}

		&.active {
			color: var(--accent);
		}

		&.localOnly.active, &.remoteFollowersOnly.active {
			color: var(--accent);
			background: inherit;
		}

		> *:nth-child(1) {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-right: 10px;
			width: 16px;
			top: 0;
			bottom: 0;
			margin-top: auto;
			margin-bottom: auto;
		}

		> *:nth-child(2) {
			flex: 1 1 auto;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			> span:first-child {
				display: block;
				font-weight: bold;
			}

			> span:last-child:not(:first-child) {
				opacity: 0.6;
			}
		}

		> *:nth-child(3) {
			display: flex;
			justify-content: center;
			align-items: center;
			margin-left: 10px;
			width: 16px;
			top: 0;
			bottom: 0;
			margin-top: auto;
			margin-bottom: auto;
		}
	}
}
</style>
