<template>
<div class="rsqzvsbo">
	<div class="_section">
		<div class="_content _panel about" v-if="meta">
			<div class="body">
				<div class="desc" v-html="meta.description || $t('introMisskey')"></div>
				<MkButton @click="signup()" style="display: inline-block; margin-right: 16px;" primary>{{ $t('signup') }}</MkButton>
				<MkButton @click="signin()" style="display: inline-block;">{{ $t('login') }}</MkButton>
			</div>
		</div>
	</div>
	<div class="_section" v-if="endpoint">
		<div class="_content header">
			<fa :icon="notesIcon"/>
			<span style="margin-left: 0.5em" v-text="notesHeader" />
		</div>
		<div class="_content">
			<XNotes :pagination="pagination"/>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { toUnicode } from 'punycode';
import XSigninDialog from '@/components/signin-dialog.vue';
import XSignupDialog from '@/components/signup-dialog.vue';
import MkButton from '@/components/ui/button.vue';
import XNotes from '@/components/notes.vue';
import { host } from '@/config';
import * as os from '@/os';
import { faFireAlt, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-regular-svg-icons';

export default defineComponent({
	components: {
		MkButton,
		XNotes,
	},

	data() {
		return {
			host: toUnicode(host),
		};
	},

	computed: {
		meta() {
			return this.$store.state.instance.meta;
		},
		endpoint() {
			return  !this.meta.disableFeatured ? 'notes/featured' :
							!this.meta.disableLocalTimeline ? 'notes/local-timeline' :
							!this.meta.disableGlobalTimeline ? 'notes/global-timeline' : null;
		},
		notesIcon() {
			switch (this.endpoint) {
				case 'notes/featured': return faFireAlt;
				case 'notes/local-timeline': return faComments;
				case 'notes/global-timeline': return faGlobe;
				default: return null;
			}
		},
		notesHeader() {
			return this.$t(this.endpoint === 'notes/featured' ? 'welcomeFeatured' : 'welcomeTimeline');
		},
		pagination() {
			if (this.endpoint === null) return null;
			return {
				endpoint: this.endpoint,
				limit: 10,
				noPaging: true,
			};
		}
	},

	created() {
		os.api('stats').then(stats => {
			this.stats = stats;
		});
	},

	methods: {
		signin() {
			os.popup(XSigninDialog, {
				autoSet: true
			}, {}, 'closed');
		},

		signup() {
			os.popup(XSignupDialog, {
				autoSet: true
			}, {}, 'closed');
		}
	}
});
</script>

<style lang="scss" scoped>
.rsqzvsbo {
	> ._section {
		> .about {
			> .body {
				padding: 32px;

				@media (max-width: 500px) {
					padding: 16px;
				}
			}
		}

		> .header {
			font-size: 20px;
			margin-bottom: 16px;
		}
	}
}
</style>
