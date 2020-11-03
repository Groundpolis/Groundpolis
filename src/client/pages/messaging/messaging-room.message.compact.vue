<template>
<div class="thvuemwp">
	<div class="content" v-if="!message.isDeleted">
		<div class="body">
			<mk-time class="time" :time="message.createdAt" mode="time"/>
			<router-link class="user" :to="message.user | userPage">
				<mk-acct :user="message.user"/>
			</router-link>
			<mfm class="text" v-if="message.text" ref="text" :text="message.text" :i="$store.state.i"/>
			<template v-if="isGroup">
				<span class="read" v-if="message.reads.length > 0">{{ $t('messageRead') }} {{ message.reads.length }}</span>
			</template>
			<template v-else>
				<span class="read" v-if="isMe && message.isRead">{{ $t('messageRead') }}</span>
			</template>
		</div>
		<div class="file" v-if="message.file">
			<a :href="message.file.url" rel="noopener" target="_blank" :title="message.file.name">
				<img v-if="message.file.type.split('/')[0] == 'image'" :src="message.file.url" :alt="message.file.name" :style="{ backgroundColor: message.file.properties.avgColor || 'transparent' }"/>
				<p v-else>{{ message.file.name }}</p>
			</a>
		</div>
	</div>
	<div class="content" v-else>
		<p class="is-deleted">{{ $t('deleted') }}</p>
	</div>
	<button class="delete-button" v-if="isMe" :title="$t('delete')" @click="del">
		<img src="/assets/remove.png" alt="Delete"/>
	</button>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { parse } from '../../../mfm/parse';
import { unique } from '../../../prelude/array';
import MkUrlPreview from '../../components/url-preview.vue';

export default Vue.extend({
	components: {
		MkUrlPreview
	},
	props: {
		message: {
			required: true
		},
		isGroup: {
			required: false
		}
	},
	computed: {
		isMe(): boolean {
			return this.message.userId == this.$store.state.i.id;
		},
		urls(): string[] {
			if (this.message.text) {
				const ast = parse(this.message.text);
				return unique(ast
					.filter(t => ((t.node.type == 'url' || t.node.type == 'link') && t.node.props.url && !t.node.props.silent))
					.map(t => t.node.props.url));
			} else {
				return null;
			}
		},
	},
	methods: {
		del() {
			os.api('messaging/messages/delete', {
				messageId: this.message.id
			});
		}
	}
});
</script>

<style lang="scss" scoped>
.thvuemwp {
	position: relative;
	background-color: transparent;
	padding-left: var(--margin);
	display: flex;

	&:hover {
		opacity: 0.7;
		> .delete-button {
			display: block;
		}
	}

	> .content {
		min-width: 0;

		padding-left: 16px;
		padding-right: 32px;
		max-width: 100%;

		> .body {

			> .time {
				font-size: 9px;
				margin-right: 8px;
				opacity: 0.7;
			}

			> .user {
				font-weight: bold;
				margin-right: 8px;
				opacity: 0.7;
			}

			> .read {
				margin-left: 8px;
				font-size: 9px;
				opacity: 0.7;
			}

			> .text {
				display: inline;
				margin: 0;
				overflow: hidden;
				overflow-wrap: break-word;
				word-break: break-word;
				font-size: 1em;

				@media (max-width: 500px) {
					padding: 8px 16px;
				}

				@media (max-width: 400px) {
					font-size: 0.9em;
				}

				& + .file {
					> a {
						border-radius: 0 0 16px 16px;
					}
				}
			}
		}

		> .file {
			> a {
				display: block;
				max-width: 100%;
				border-radius: 16px;
				overflow: hidden;
				text-decoration: none;

				&:hover {
					text-decoration: none;

					> p {
						background: #ccc;
					}
				}

				> * {
					display: block;
					margin: 0;
					width: 100%;
					max-height: 512px;
					object-fit: contain;
					box-sizing: border-box;
				}

				> p {
					padding: 30px;
					text-align: center;
					color: #555;
					background: #ddd;
				}
			}
		}
	}

	> .delete-button {
		display: none;
		position: absolute;
		z-index: 1;
		right: 16px;
		margin: 0;
		padding: 0;
		cursor: pointer;
		outline: none;
		border: none;
		border-radius: 0;
		box-shadow: none;
		background: transparent;

		> img {
			vertical-align: bottom;
			width: 16px;
			height: 16px;
			cursor: pointer;
		}
	}
}
</style>
