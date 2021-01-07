<template>
<section class="uawsfosz _section">
	<div class="_title">{{ $ts.drive }}</div>
	<div class="_content">
		<span>{{ $ts.uploadFolder }}: {{ uploadFolder ? uploadFolder.name : '-' }}</span>
		<MkButton primary @click="chooseUploadFolder()"><Fa :icon="faFolderOpen"/> {{ $ts.selectFolder }}</MkButton>
	</div>
</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faClock, faEyeSlash, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import MkButton from '@/components/ui/button.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
	},

	data() {
		return {
			uploadFolder: null,
			faClock, faEyeSlash, faFolderOpen, faTrashAlt
		}
	},

	async created() {
		if (this.$store.state.uploadFolder) {
			this.uploadFolder = await os.api('drive/folders/show', {
				folderId: this.$store.state.uploadFolder
			});
		}
	},

	methods: {
		chooseUploadFolder() {
			os.selectDriveFolder(false).then(async folder => {
				this.$store.set('uploadFolder', folder ? folder.id : null);
				os.success();
				if (this.$store.state.uploadFolder) {
					this.uploadFolder = await os.api('drive/folders/show', {
						folderId: this.$store.state.uploadFolder
					});
				} else {
					this.uploadFolder = null;
				}
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.uawsfosz {

}
</style>
