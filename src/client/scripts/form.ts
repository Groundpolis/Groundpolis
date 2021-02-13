export type FormItem = {
	label?: string;
	hidden?: boolean;
	description?: string;
} & ({
	type: 'string';
	default: string | null;
	multiline?: boolean;
} | {
	type: 'number';
	default: number | null;
	step?: number;
} | {
	type: 'boolean';
	default: boolean | null;
} | {
	type: 'enum';
	default: string | null;
	enum: Array<{ label: string, value: string }>;
} | {
	type: 'array';
	default: unknown[] | null;
});

export type Form = Record<string, FormItem>;
