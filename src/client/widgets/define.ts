import { defineComponent } from 'vue';
import { Form } from '@/scripts/form';
import * as os from '@/os';

export default function <T extends Form>(data: {
	name: string;
	props?: () => T;
}) {
	return defineComponent({
		props: {
			widget: {
				type: Object,
				required: false
			},
			settingCallback: {
				required: false
			}
		},

		emits: ['updateProps'],

		data() {
			return {
				props: this.widget ? JSON.parse(JSON.stringify(this.widget.data)) : {}
			};
		},

		computed: {
			id(): string {
				return this.widget ? this.widget.id : null;
			},
		},

		created() {
			this.mergeProps();

			this.$watch('props', () => {
				this.mergeProps();
			}, { deep: true });

			if (this.settingCallback) this.settingCallback(this.setting);
		},

		methods: {
			mergeProps() {
				if (data.props) {
					const defaultProps = data.props();
					for (const prop of Object.keys(defaultProps)) {
						if (this.props.hasOwnProperty(prop)) continue;
						this.props[prop] = defaultProps[prop].default;
					}
				}
			},

			async setting() {
				const form = data.props();
				for (const item of Object.keys(form)) {
					form[item].default = this.props[item];
				}
				const { canceled, result } = await os.form(data.name, form);
				if (canceled) return;

				for (const key of Object.keys(result)) {
					this.props[key] = result[key];
				}

				this.save();
			},

			save() {
				this.$emit('updateProps', this.props);
			}
		}
	});
}
