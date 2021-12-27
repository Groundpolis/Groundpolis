<template>
<FormBase>
	<div class="_formItem">
		<div class="_formLabel" style="font-size: 100%">{{ $ts._labs.description }}</div>
		<div class="_formLabel" style="font-size: 100%">
			<MkLink url="https://discord.gg/z2C7uG62fC" class="at">{{ $ts._labs.review }}</MkLink>
		</div>
	</div>

	<!-- <div class="_formItem _formPanel" style="padding: 16px;">
		{{ $ts._labs.notAvailable }}
	</div> -->

	<FormSwitch v-model:value="disableReactions">
		{{ $ts._labs.useLike }}
		<template #desc>{{ $ts._labs.useLikeDesc }}</template>
	</FormSwitch>

	<FormSwitch v-model:value="tryNewPostForm">
		{{ $ts._labs.tryNewPostForm }}
		<template #desc>{{ $ts._labs.tryNewPostFormDesc }}</template>
	</FormSwitch>
	<FormLink to="labs/custom-css">
		{{ $ts._labs.customCss }}
	</FormLink>
	<div class="_formItem" style="margin-top: 96px">
		<div class="_formLabel" style="font-size: 100%">以下は完全に開発者向けのため非推奨</div>
	</div>
	<FormLink to="experimental-features">
		{{ $ts.experimentalFeatures }} (Misskey)
	</FormLink>
	<FormButton @click="sendSystemNotification">通知テスト</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormBase from '@/components/form/base.vue';
import FormLink from '@/components/form/link.vue';
import FormSwitch from '@/components/form/switch.vue';
import FormButton from '@/components/form/button.vue';
import MkLink from '@/components/link.vue';
import { defaultStore } from '@/store';
import { notify } from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
		FormSwitch,
		FormButton,
		MkLink,
	},

	computed: {
		disableReactions: defaultStore.makeGetterSetter('disableReactions'),
		tryNewPostForm: defaultStore.makeGetterSetter('tryNewPostForm'),
	},

	watch: {
	},

	methods: {
		sendSystemNotification() {
			notify({
				body: '$[x2 **悪行を検知しました**]\n**罪状**: $[rainbow ボタンがあったらとりあえず押す人取締法違反]',
			});
		},
	},
});
</script>
