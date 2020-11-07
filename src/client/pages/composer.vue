<template>
	<div>
		<header class="_section">
			<div class="_content">
				<!-- {{ $t('composerDescription') }} -->
				音楽を作ろう。直感的な操作で、あなただけのオリジナル曲を作ることができます。作った曲はフォロワーと共有して楽しもう。
			</div>
		</header>
		<section class="_section">
			<div class="_title">作成した曲</div>
			<div class="_content">
				<div class="_card _vMargin">
						<div class="_content">
						</div>
				</div>
			</div>
		</section>
		<section class="_section">
			<div class="_title">他のユーザーが作成した曲</div>
			<div class="_content">
				<div class="_card _vMargin">
						<div class="_content">
						</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faMusic, faPlus } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
	components: {
		
	},

	props: {
		
	},

	data() {
		return {
			INFO: {
				title: 'Groundpolis Composer',
				icon: faMusic,
				action: {
					icon: faPlus,
					action: () => {

					},
				},
			},
			
		}
	},

	methods: {
	}
});
</script>

<style lang="scss" scoped>
</style>
