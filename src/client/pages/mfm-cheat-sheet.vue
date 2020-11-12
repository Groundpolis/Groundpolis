<template>
<div class="mwysmxbg">
	<div class="_section">
		<div class="_content">
			<p>{{ $t('_mfm.intro') }}</p>
		</div>
	</div>
	<XSection v-for="s in sections" :key="s[0]"
		:title="$t(`_mfm.${s[0]}`)"
		:description="$t(`_mfm.${s[0]}Description`)"
		:initialPreview="s[1]"/>
</div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import XSection from './mfm-cheat-sheet.section.vue';

export default defineComponent({
	components: {
		XSection
	},

	data() {
		return {
			INFO: {
				title: this.$t('_mfm.cheatSheet'),
				icon: faQuestionCircle,
			},
			sections: markRaw([
				[ 'mention', '@example' ],
				[ 'hashtag', '#test' ],
				[ 'url', `https://example.com` ],
				[ 'link', `[${this.$t('_mfm.dummy')}](https://example.com)` ],
				[ 'emoji', `:${this.$store.state.instance.meta.emojis[0].name}:` ],
				[ 'userEmoji', `:@${this.$store.state.i.username}:` ],
				[ 'bold', `**${this.$t('_mfm.dummy')}**` ],
				[ 'small', `<small>${this.$t('_mfm.dummy')}</small>` ],
				[ 'center', `<center>${this.$t('_mfm.dummy')}</center>` ],
				[ 'right', `<right>${this.$t('_mfm.dummy')}</right>` ],
				[ 'sup', `<sup>${this.$t('_mfm.dummy')}</sup>` ],
				[ 'sub', `<sub>${this.$t('_mfm.dummy')}</sub>` ],
				[ 'inlineCode', '`<: "Hello, world!"`' ],
				[ 'blockCode', '```\n~ (#i, 100) {\n\t<: ? ((i % 15) = 0) "FizzBuzz"\n\t\t.? ((i % 3) = 0) "Fizz"\n\t\t.? ((i % 5) = 0) "Buzz"\n\t\t. i\n}\n```' ],
				[ 'inlineMath', '\\(x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\)' ],
				[ 'blockMath', '\\[x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\]' ],
				[ 'quote', `> ${this.$t('_mfm.dummy')}` ],
				[ 'search', `${this.$t('_mfm.dummy')} 検索` ],
				[ 'jelly', `[jelly 🍮]` ],
				[ 'tada', `[tada 🍮]` ],
				[ 'wobble', `[wobble 🍮]` ],
				[ 'jump', `[jump 🍮]` ],
				[ 'blink', `[blink 🍮]` ],
				[ 'rainbow', `[rainbow ${this.$t('_mfm.dummy')}]` ],
				[ 'bounce', `[bounce 🍮]` ],
				[ 'shake', `[shake 🍮]` ],
				[ 'twitch', `[twitch 🍮]` ],
				[ 'spin', `[spin 🍮] [spin.left 🍮] [spin.alternate 🍮]\n[spin.x 🍮] [spin.x,left 🍮] [spin.x,alternate 🍮]\n[spin.y 🍮] [spin.y,left 🍮] [spin.y,alternate 🍮]` ],
				[ 'flip', `[flip ${this.$t('_mfm.dummy')}]\n[flip.v ${this.$t('_mfm.dummy')}]\n[flip.h,v ${this.$t('_mfm.dummy')}]` ],
			]),
		}
	},
});
</script>

<style lang="scss" scoped>
.mwysmxbg {
	.preview {
		padding: 16px;
	}
}
</style>
