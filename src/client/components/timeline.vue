<template>
<x-notes ref="tl" :pagination="pagination" @before="$emit('before')" @after="e => $emit('after', e)" @queue="$emit('queue', $event)"/>
</template>

<script lang="ts">
import Vue from 'vue';
import XNotes from './notes.vue';

export default Vue.extend({
	components: {
		XNotes
	},

	props: {
		src: {
			type: String,
			required: true
		},
		list: {
			required: false
		},
		antenna: {
			required: false
		},
		sound: {
			type: Boolean,
			required: false,
			default: false,
		}
	},

	data() {
		return {
			connection: null,
			connection2: null,
			pagination: null,
			query: {},
		};
	},

	created() {
		this.$once('hook:beforeDestroy', () => {
			this.connection.dispose();
			if (this.connection2) this.connection2.dispose();
		});

		const prepend = note => {
			const _note = JSON.parse(JSON.stringify(note));	// deepcopy
			(this.$refs.tl as any).prepend(_note);

			if (this.sound) {
				this.$root.sound(note.userId === this.$store.state.i.id ? 'noteMy' : 'note');
			}
		};

		const onChangeFollowing = () => {
			if (!this.$refs.tl.backed) {
				this.$refs.tl.reload();
			}
		};

		let endpoint;

		if (this.src == 'myself') {
			endpoint = 'notes/timeline';
			this.connection = this.$root.stream.useSharedConnection('homeTimeline');
			this.connection.on('note', prepend);

			this.connection2 = this.$root.stream.useSharedConnection('main');
			this.connection2.on('follow', onChangeFollowing);
			this.connection2.on('unfollow', onChangeFollowing);
		} else if (this.src == 'everyone') {
			endpoint = 'notes/local-timeline';
			this.connection = this.$root.stream.useSharedConnection('localTimeline');
			this.connection.on('note', prepend);
		}

		this.pagination = {
			endpoint: endpoint,
			limit: 10,
			params: init => ({
				untilDate: init ? undefined : (this.date ? this.date.getTime() : undefined),
				...this.query
			})
		};
	},

	methods: {
		focus() {
			this.$refs.tl.focus();
		}
	}
});
</script>
