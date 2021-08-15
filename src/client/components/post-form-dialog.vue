<template>
<MkModal ref="modal" @click="$refs.modal.close()" @closed="$emit('closed')" :position="'top'">
	<MkPostFormV2 v-if="$store.reactiveState.tryNewPostForm.value" @posted="$refs.modal.close()" @cancel="$refs.modal.close()" @esc="$refs.modal.close()" v-bind="$attrs"/>
	<MkPostForm v-else @posted="$refs.modal.close()" @cancel="$refs.modal.close()" @esc="$refs.modal.close()" v-bind="$attrs"/>
</MkModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MkModal from '@/components/ui/modal.vue';
import MkPostForm from '@/components/post-form.vue';
import MkPostFormV2 from '@/components/post-form-v2.vue';

export default defineComponent({
	components: {
		MkModal,
		MkPostForm,
		MkPostFormV2
	},
	emits: ['closed'],
});
</script>
