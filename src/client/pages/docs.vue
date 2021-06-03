<template>
<FormBase>
	<FormGroup>
		<FormLink v-for="doc in docs" :key="doc.path" :to="`/docs/${doc.path}`">{{ doc.title }}</FormLink>
	</FormGroup>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { url, lang } from '@/config';

import FormBase from '@/components/form/base.vue';
import FormLink from '@/components/form/link.vue';
import FormGroup from '@/components/form/group.vue';

export default defineComponent({
	components: {
		FormBase,
		FormLink,
		FormGroup
	},
	data() {
		return {
			INFO: {
				title: this.$ts.help,
				icon: faQuestionCircle
			},
			docs: [] as any[],
			faQuestionCircle
		}
	},

	created() {
		fetch(`${url}/docs.json?lang=${lang}`).then(res => res.json()).then(docs => {
			this.docs = docs;
		});
	},
});
</script>
