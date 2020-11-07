<template>
<div class="znqjceqz">
	<section class="_section">
		<div class="_content" style="text-align: center;">
			<img src="/assets/icons/512.png" alt="" style="display: block; width: 100px; margin: 0 auto; border-radius: 16px;"/>
			<div style="margin-top: 0.75em;">Groundpolis</div>
			<div style="opacity: 0.5;">v{{ version }}</div>
		</div>
	</section>
	<section class="_section">
		<div class="_content">
			<div style="margin-bottom: 1em;">{{ $t('aboutMisskeyText') }}</div>
			<div>🛠️ {{ $t('misskeyMembers') }}</div>
			<ul class="members">
				<li><MkLink url="https://github.com/Xeltica" class="at">@Xeltica</MkLink></li>
			</ul>
			<div style="margin-top: 1em;">📦 {{ $t('misskeySource') }}</div>
			<MkUrl url="https://github.com/groundpolis/groundpolis"/>
			<div style="margin-top: 1em;">💴 {{ $t('misskeyDonate') }}</div>
			<MkUrl url="https://www.patreon.com/syuilo"/>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { version } from '@/config';
import MkLink from '@/components/link.vue';
import MkUrl from '@/components/url.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkLink, MkUrl
	},

	data() {
		return {
			INFO: {
				title: this.$t('aboutMisskey'),
				icon: null
			},
			version,
			faInfoCircle
		}
	},
});
</script>
