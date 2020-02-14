<template>
<div class="znqjceqz">
	<portal to="title">🍀 {{ $t('aboutMisskey') }}</portal>

	<section class="_card">
		<div class="_title">🍀 {{ $t('aboutMisskey') }}</div>
		<div class="_content">
			<div style="margin-bottom: 1em;">{{ $t('aboutMisskeyText') }}</div>
			<div>🛠️ {{ $t('misskeyMembers') }}</div>
			<ul class="members">
				<li><mk-link url="https://github.com/Xeltica" class="at">@Xeltica</mk-link></li>
			</ul>
			<div style="margin-top: 1em;">📦 {{ $t('misskeySource') }}</div>
			<mk-url url="https://github.com/groundpolis/groundpolis"/>
			<div style="margin-top: 1em;">💴 {{ $t('misskeyDonate') }}</div>
			<mk-url url="https://www.patreon.com/syuilo"/>
		</div>
	</section>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { version } from '../config';
import i18n from '../i18n';
import MkLink from '../components/link.vue';

export default Vue.extend({
	i18n,

	components: {
		MkLink
	},

	metaInfo() {
		return {
			title: this.$t('aboutMisskey') as string
		};
	},

	data() {
		return {
			version,
			faInfoCircle
		}
	},
});
</script>
