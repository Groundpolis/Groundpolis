<template>
<FormBase>
	<FormButton @click="generateToken" primary>{{ $t('generateAccessToken') }}</FormButton>
	<FormLink to="/settings/apps">{{ $t('manageAccessTokens') }}</FormLink>
	<FormLink to="/api-console" :behavior="isDesktop ? 'window' : null">API console</FormLink>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faKey } from '@fortawesome/free-solid-svg-icons';
import FormSwitch from '@/components/form/switch.vue';
import FormSelect from '@/components/form/select.vue';
import FormLink from '@/components/form/link.vue';
import FormBase from '@/components/form/base.vue';
import FormGroup from '@/components/form/group.vue';
import FormButton from '@/components/form/button.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		FormBase,
		FormButton,
		FormLink,
	},

	data() {
		return {
			isDesktop: window.innerWidth >= 1100,
		};
	},

	methods: {
		generateToken() {
			os.popup(import('@/components/token-generate-window.vue'), {}, {
				done: async result => {
					const { name, permissions } = result;
					const { token } = await os.api('miauth/gen-token', {
						session: null,
						name: name,
						permission: permissions,
					});

					os.dialog({
						type: 'success',
						title: this.$t('token'),
						text: token
					});
				},
			}, 'closed');
		},
	}
});
</script>
