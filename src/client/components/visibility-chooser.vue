<template>
<x-popup :source="source" ref="popup" @closed="() => { $emit('closed'); choose(v); destroyDom(); }">
	<div class="gqyayizv">
		<button class="_button" @click="choose('public')" :class="{ active: v == 'public' }" data-index="1" key="public">
			<div><fa :icon="faGlobe"/></div>
			<div>
				<span>{{ $t('_visibility.public') }}</span>
				<span>{{ $t('_visibility.publicDescription') }}</span>
			</div>
		</button>
		<button class="_button" @click="choose('home')" :class="{ active: v == 'home' }" data-index="2" key="home">
			<div><fa :icon="faHome"/></div>
			<div>
				<span>{{ $t('_visibility.home') }}</span>
				<span>{{ $t('_visibility.homeDescription') }}</span>
			</div>
		</button>
		<button v-if="!remoteFollowersOnly" class="_button" @click="choose('followers')" :class="{ active: v == 'followers' }" data-index="3" key="followers">
			<div><fa :icon="faUnlock"/></div>
			<div>
				<span>{{ $t('_visibility.followers') }}</span>
				<span>{{ $t('_visibility.followersDescription') }}</span>
			</div>
		</button>
		<button v-if="!localOnly && !remoteFollowersOnly" class="_button" @click="choose('specified')" :class="{ active: v == 'specified' }" data-index="4" key="specified">
			<div><fa :icon="faEnvelope"/></div>
			<div>
				<span>{{ $t('_visibility.specified') }}</span>
				<span>{{ $t('_visibility.specifiedDescription') }}</span>
			</div>
		</button>
		<button v-if="!localOnly && !remoteFollowersOnly" class="_button" @click="choose('users')" :class="{ active: v == 'users' }" data-index="5" key="users">
			<div><fa :icon="faUsers"/></div>
			<div>
				<span>{{ $t('_visibility.users') }}</span>
				<span>{{ $t('_visibility.usersDescription') }}</span>
			</div>
		</button>
		<button class="_button" @click="localOnly = !localOnly" :class="{ active: localOnly }" data-index="6" key="localOnly">
			<div><fa :icon="faHeart"/></div>
			<div>
				<span>{{ $t('_visibility.localOnly') }}</span>
				<span>{{ $t('_visibility.localOnlyDescription') }}</span>
			</div>
		</button>
		<button class="_button" @click="remoteFollowersOnly = !remoteFollowersOnly" :class="{ active: remoteFollowersOnly }" data-index="6" key="remoteFollowersOnly">
			<div><fa :icon="faHeartbeat"/></div>
			<div>
				<span>{{ $t('_visibility.remoteFollowersOnly') }}</span>
				<span>{{ $t('_visibility.remoteFollowersOnlyDescription') }}</span>
			</div>
		</button>
	</div>
</x-popup>
</template>

<script lang="ts">
import Vue from 'vue';
import { faGlobe, faUnlock, faHome, faUsers, faHeart, faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import i18n from '../i18n';
import XPopup from './popup.vue';

export default Vue.extend({
	i18n,
	components: {
		XPopup
	},
	props: {
		source: {
			required: true
		},
		currentVisibility: {
			type: String,
			required: false
		},
		initialLocalOnly: {
			type: Boolean,
			required: false
		},
		initialRemoteFollowersOnly: {
			type: Boolean,
			required: false
		},
	},
	data() {
		return {
			v: this.$store.state.settings.rememberNoteVisibility ? this.$store.state.deviceUser.visibility : (this.currentVisibility || this.$store.state.settings.defaultNoteVisibility),
			localOnly: this.initialLocalOnly || false,
			remoteFollowersOnly: this.initialRemoteFollowersOnly || false,
			faGlobe, faUnlock, faEnvelope, faHome, faUsers, faHeart, faHeartbeat
		}
	},
	watch: {
		localOnly() {
			if (this.localOnly && this.remoteFollowersOnly) {
				this.remoteFollowersOnly = false;
			}
			if (this.localOnly && ['specified', 'users'].includes(this.v)) this.v = 'followers';

		},
		remoteFollowersOnly() {
			if (this.localOnly && this.remoteFollowersOnly) {
				this.localOnly = false;
			}
			if (this.remoteFollowersOnly && ['followers', 'specified', 'users'].includes(this.v)) this.v = 'home';
		}
	},
	methods: {
		choose(visibility) {
			if (this.$store.state.settings.rememberNoteVisibility) {
				this.$store.commit('deviceUser/setVisibility', visibility);
			}
			this.$emit('chosen', { visibility, localOnly: this.localOnly, remoteFollowersOnly: this.remoteFollowersOnly} );
			this.destroyDom();
		},
	}
});
</script>

<style lang="scss" scoped>
.gqyayizv {
	width: 240px;
	padding: 8px 0;

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
			color: #fff;
			background: var(--accent);
		}

		> *:first-child {
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

		> *:last-child {
			flex: 1 1 auto;

			> span:first-child {
				display: block;
				font-weight: bold;
			}

			> span:last-child:not(:first-child) {
				opacity: 0.6;
			}
		}
	}
}
</style>
