<template>
<div class="_section">
	<section class="_card _vMargin">
		<div class="_content">
			<MkSwitch v-model:value="disableAnimatedMfm">{{ $t('disableAnimatedMfm') }}</MkSwitch>
			<MkSwitch v-model:value="reduceAnimation">{{ $t('reduceUiAnimation') }}</MkSwitch>
			<MkSwitch v-model:value="useBlurEffectForModal">{{ $t('useBlurEffectForModal') }}</MkSwitch>
			<MkSwitch v-model:value="useOsNativeEmojis">
				{{ $t('useOsNativeEmojis') }}
				<template #desc><Mfm text="🍮🍦🍭🍩🍰🍫🍬🥞🍪"/></template>
			</MkSwitch>
		</div>
		<div class="_content">
			<MkRadios v-model="fontSize">
				<template #desc>{{ $t('fontSize') }}</template>
				<option value="small"><span style="font-size: 14px;">Aa</span></option>
				<option :value="null"><span style="font-size: 16px;">Aa</span></option>
				<option value="large"><span style="font-size: 18px;">Aa</span></option>
				<option value="veryLarge"><span style="font-size: 20px;">Aa</span></option>
			</MkRadios>
		</div>
		<div class="_content">
			<MkRadios v-model="instanceTicker">
				<template #desc>{{ $t('instanceTicker') }}</template>
				<option value="none">{{ $t('_instanceTicker.none') }}</option>
				<option value="remote">{{ $t('_instanceTicker.remote') }}</option>
				<option value="always">{{ $t('_instanceTicker.always') }}</option>
			</MkRadios>
		</div>
	</section>
	<section class="_card _vMargin">
		<div class="_content">
			<MkSwitch v-model:value="collapseLongNote">{{ $t('collapseLongNote') }}</MkSwitch>
			<MkSwitch v-model:value="useDisplayNameForSidebar">{{ $t('useDisplayNameForSidebar') }}</MkSwitch>
			<MkSwitch v-model:value="useSticker">
				{{ $t('useSticker') }}
				<template #desc>{{$t('useStickerDesc')}}</template>
			</MkSwitch>
			<MkSwitch v-model:value="makeCustomEmojisBigger">
				{{ $t('makeCustomEmojisBigger') }}
				<template #desc>{{$t('makeCustomEmojisBiggerDesc')}}</template>
			</MkSwitch>
			<MkSwitch v-model:value="showFullAcct">
				{{ $t('showFullAcct') }}
				<template #desc><MkAcct :user="$store.state.i"/></template>
			</MkSwitch>
			<MkSelect v-model:value="noteNameDisplayMode">
				<template #label>{{ $t('noteNameDisplayMode') }}</template>
				<option v-for="(x, i) in [ 'displayNameAndUserName', 'userNameAndDisplayName', 'displayNameOnly', 'userNameOnly' ]" :value="i" :key="x">{{ $t(x) }}</option>
				<template #text>
					<span v-if="noteNameDisplayMode === 0">
						<b style="margin-right: 1em">{{ $store.state.i.name || $store.state.i.username }}</b>
						<MkAcct :user="$store.state.i"/>
					</span>
					<span v-else>
						<MkAcct v-if="noteNameDisplayMode !== 2" style="margin-right: 1em" :user="$store.state.i"/>
						<b v-if="noteNameDisplayMode !== 3">{{ $store.state.i.name || $store.state.i.username }}</b>
					</span>
				</template>
			</MkSelect>
		</div>
	</section>
	<section class="_card _vMargin">
		<div class="_content">
			<div>{{ $t('iconShape') }}</div>
			<MkSelect v-model:value="iconShape">
				<option v-for="x in [ 'circle', 'square', 'rounded', 'droplet' ]" :value="x" :key="x">
					{{ $t(`_iconShape.${x}`) }}
				</option>
			</MkSelect>
			<MkAvatar disable-link disable-preview :user="$store.state.i" class="avatar"/>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkButton from '@/components/ui/button.vue';
import MkSwitch from '@/components/ui/switch.vue';
import MkSelect from '@/components/ui/select.vue';
import MkRadio from '@/components/ui/radio.vue';
import MkRadios from '@/components/ui/radios.vue';

export default defineComponent({
	components: {
		MkButton,
		MkSwitch,
		MkRadio,
		MkSelect,
		MkRadios,
	},

	data() {
		return {
			fontSize: localStorage.getItem('fontSize'),
		}
	},

	computed: {
		reduceAnimation: {
			get() { return !this.$store.state.device.animation; },
			set(value) { this.$store.commit('device/set', { key: 'animation', value: !value }); }
		},

		useBlurEffectForModal: {
			get() { return this.$store.state.device.useBlurEffectForModal; },
			set(value) { this.$store.commit('device/set', { key: 'useBlurEffectForModal', value: value }); }
		},

		disableAnimatedMfm: {
			get() { return !this.$store.state.device.animatedMfm; },
			set(value) { this.$store.commit('device/set', { key: 'animatedMfm', value: !value }); }
		},

		useOsNativeEmojis: {
			get() { return this.$store.state.device.useOsNativeEmojis; },
			set(value) { this.$store.commit('device/set', { key: 'useOsNativeEmojis', value }); }
		},

		instanceTicker: {
			get() { return this.$store.state.device.instanceTicker; },
			set(value) { this.$store.commit('device/set', { key: 'instanceTicker', value }); }
		},

		enableInfiniteScroll: {
			get() { return this.$store.state.device.enableInfiniteScroll; },
			set(value) { this.$store.commit('device/set', { key: 'enableInfiniteScroll', value }); }
		},
		
		makeCustomEmojisBigger: {
			get() { return this.$store.state.device.makeCustomEmojisBigger; },
			set(value) { this.$store.commit('device/set', { key: 'makeCustomEmojisBigger', value: value }); }
		},

		useSticker: {
			get() { return this.$store.state.device.useSticker; },
			set(value) { this.$store.commit('device/set', { key: 'useSticker', value: value }); }
		},

		collapseLongNote: {
			get() { return this.$store.state.device.collapseLongNote },
			set(value) { this.$store.commit('device/set', { key: 'collapseLongNote', value }); }
		},

		noteNameDisplayMode: {
			get() { return this.$store.state.device.noteNameDisplayMode },
			set(value) { this.$store.commit('device/set', { key: 'noteNameDisplayMode', value }) }
		},

		showFullAcct: {
			get() { return this.$store.state.settings.showFullAcct },
			set(value) { this.$store.dispatch('settings/set', { key: 'showFullAcct', value }) }
		},

		iconShape: {
			get() { return this.$store.state.device.iconShape; },
			set(value) { this.$store.commit('device/set', { key: 'iconShape', value }); }
		},

		useDisplayNameForSidebar: {
			get() { return this.$store.state.settings.useDisplayNameForSidebar; },
			set(value) { this.$store.dispatch('settings/set', { key: 'useDisplayNameForSidebar', value }); }
		},
	},

	watch: {
		fontSize() {
			if (this.fontSize == null) {
				localStorage.removeItem('fontSize');
			} else {
				localStorage.setItem('fontSize', this.fontSize);
			}
			location.reload();
		},
	},
});
</script>

<style lang="scss" scoped>
	.avatar {
		// for NEKOMIMI
		margin-top: 32px;
		width: 64px;
		height: 64px;
	}
</style>
