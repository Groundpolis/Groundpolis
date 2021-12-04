<template>
<div class="mwysmxbg">
	<div class="_section">
		<div class="_content">
			<p>{{ $ts._mfm.intro }}</p>
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
				title: this.$ts._mfm.cheatSheet,
				icon: faQuestionCircle,
			},
			sections: markRaw([
				[ 'mention', '@example' ],
				[ 'hashtag', '#test' ],
				[ 'url', `https://example.com` ],
				[ 'link', `[${this.$ts._mfm.dummy}](https://example.com)` ],
				[ 'emoji', `:${this.$instance.emojis[0].name}:` ],
				[ 'userEmoji', `:@${this.$i.username}:` ],
				[ 'bold', `**${this.$ts._mfm.dummy}**` ],
				[ 'small', `<small>${this.$ts._mfm.dummy}</small>` ],
				[ 'center', `<center>${this.$ts._mfm.dummy}</center>` ],
				[ 'right', `<right>${this.$ts._mfm.dummy}</right>` ],
				[ 'sup', `a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>` ],
				[ 'sub', `2H<sub>2</sub>O → 2H<sub>2</sub> + O<sub>2</sub>` ],
				[ 'inlineCode', '`<: "Hello, world!"`' ],
				[ 'blockCode', '```\n~ (#i, 100) {\n\t<: ? ((i % 15) = 0) "FizzBuzz"\n\t\t.? ((i % 3) = 0) "Fizz"\n\t\t.? ((i % 5) = 0) "Buzz"\n\t\t. i\n}\n```' ],
				[ 'inlineMath', '\\(x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\)' ],
				[ 'blockMath', '\\[x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\]' ],
				[ 'quote', `> ${this.$ts._mfm.dummy}` ],
				[ 'search', `${this.$ts._mfm.dummy} 検索` ],
				[ 'x2', `$[x2 🍮]` ],
				[ 'x3', `$[x3 🍮]` ],
				[ 'x4', `$[x4 🍮]` ],
				[ 'blur', `$[blur ${this.$ts._mfm.dummy}]` ],
				[ 'jelly', `$[jelly 🍮]` ],
				[ 'tada', `$[tada 🍮]` ],
				[ 'wobble', `$[wobble 🍮]` ],
				[ 'jump', `$[jump 🍮]` ],
				[ 'blink', `$[blink 🍮]` ],
				[ 'rainbow', `$[rainbow ${this.$ts._mfm.dummy}]` ],
				[ 'bounce', `$[bounce 🍮]` ],
				[ 'shake', `$[shake 🍮]` ],
				[ 'twitch', `$[twitch 🍮]` ],
				[ 'spin', `$[spin 🍮] $[spin.left 🍮] $[spin.alternate 🍮]\n$[spin.x 🍮] $[spin.x,left 🍮] $[spin.x,alternate 🍮]\n$[spin.y 🍮] $[spin.y,left 🍮] $[spin.y,alternate 🍮]` ],
				[ 'flip', `$[flip ${this.$ts._mfm.dummy}]\n$[flip.v ${this.$ts._mfm.dummy}]\n$[flip.h,v ${this.$ts._mfm.dummy}]` ],
				[ 'rotate', `$[rotate.y,deg=340 ${this.$ts._mfm.dummy}]` ],
				[ 'font', `$[font.size=48px,color=red ${this.$ts._mfm.dummy}]` ],
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
