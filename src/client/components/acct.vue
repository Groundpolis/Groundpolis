<template functional>
<span class="mk-acct" v-once>
	<span class="name">@{{ props.user.username }}</span>
</span>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	name: 'MkAcct',
	props: ['user', 'detail'],
});
</script>
