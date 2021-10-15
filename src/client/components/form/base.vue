<template>
<div class="rbusrurv">
	<slot></slot>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss" scoped>
.rbusrurv {
	line-height: 1.4em;
	background: var(--bg);
	padding: 16px;

	&:not(.wide).max-width_400px {
		padding: 32px 0;

		> ::v-deep(*) {
			._formPanel {
				border: solid 0.5px var(--divider);
				border-radius: 0;
				border-left: none;
				border-right: none;
			}

			._form_group {
				> * {
					&:not(:first-child) {
						&._formPanel, ._formPanel {
							border-top: none;
						}
					}

					&:not(:last-child) {
						&._formPanel, ._formPanel {
							border-bottom: solid 0.5px var(--divider);
						}
					}
				}
			}
		}
	}
}
</style>
