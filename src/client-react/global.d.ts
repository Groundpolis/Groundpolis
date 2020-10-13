import 'reactn';

declare module 'reactn/default' {
	export interface State {
		meta: Record<string, unknown> | null,
		i: Record<string, unknown> | null,
	}
}
