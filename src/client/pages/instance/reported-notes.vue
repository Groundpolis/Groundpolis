<template>
<div class="rch3n20a">
	<portal to="icon"><fa :icon="faExclamationCircle"/></portal>
	<portal to="title">{{ $t('reportedNotes') }}</portal>
	<mk-pagination :pagination="pagination" class="reports" ref="emojis">
		<template #empty><span>{{ $t('noReportedNotes') }}</span></template>
		<template #default="{items}">
			<div v-for="item in items" :key="item.id" class="_panel report">
				<div class="reporter"><router-link :to="'/instance/users/' + item.reporterId">{{ $t('reporter') }}: @{{ item.reporter.username }}</router-link></div>
				<mk-time class="time" :time="item.createdAt" />
				<div class="deleted" v-if="!item.note">
					<fa :icon="faTimesCircle" />
					{{ $t('thisNoteIsDeleted') }}
				</div>
				<div class="comment">{{ item.comment }}</div>
				<div class="note">
					<div class="user"><router-link :to="'/instance/users/' + item.noteUserId">@{{ item.note ? item.note.user.username : item.noteUserId }}</router-link></div>
					<router-link v-if="item.note" class="time" :to="item.note | notePage"><mk-time :time="item.note ? item.note.createdAt : item.noteCreatedAt" /></router-link>
					<mk-time v-else class="time" :time="item.note ? item.note.createdAt : item.noteCreatedAt" />
					<div>
						<mfm v-if="item.note ? item.note.cw : item.noteCw" :text="item.note ? item.note.cw : item.noteCw"/>
					</div>
					<div>
						<mfm :text="item.note ? item.note.text : item.noteText"/>
					</div>
				</div>
			</div>
		</template>
	</mk-pagination>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { faExclamationCircle, faPlus, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faSave, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import MkPagination from '../../components/ui/pagination.vue';

export default Vue.extend({
	metaInfo() {
		return {
			title: this.$t('reportedNotes') as string,
		};
	},

	components: {
		MkPagination,
	},

	data() {
		return {
			pagination: {
				endpoint: 'admin/reported-notes',
				limit: 10,
			},
			faExclamationCircle, faSave, faTrashAlt, faPlus, faTimesCircle
		}
	},

	created() {
		
	},

	methods: {
		
	}
});
</script>

<style lang="scss" scoped>
.rch3n20a {
	> .reports {
		> .report {
			padding: 16px;
			> .reporter {
				font-weight: bold;
				margin-bottom: 4px;
			}
			.time {
				position: absolute;
				right: 16px;
				top: 16px;
			}
			> .comment {
				padding-left: 1em;
				opacity: 0.7;
			}
			> .note {
				position: relative;
				border: 1px dashed var(--divider);
				padding: 8px;

				> .time {
					top: 8px;
					right: 8px;
				}
			}
		}
	}
}
</style>
