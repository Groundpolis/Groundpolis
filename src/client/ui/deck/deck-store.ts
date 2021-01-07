import { i18n } from '@/i18n';
import { markRaw } from 'vue';
import { Storage } from '../../pizzax';

type ColumnWidget = {
	name: string;
	id: string;
	data: Record<string, any>;
};

type Column = {
	id: string;
	type: string;
	name: string | null;
	width: number;
	widgets?: ColumnWidget[];
};

function copy<T>(x: T): T {
	return JSON.parse(JSON.stringify(x));
}

export const deckStore = markRaw(new Storage('deck', {
	columns: {
		where: 'deviceAccount',
		default: [{
			id: 'a',
			type: 'main',
			name: i18n.locale._deck._columns.main,
			width: 350,
		}, {
			id: 'b',
			type: 'notifications',
			name: i18n.locale._deck._columns.notifications,
			width: 330,
		}] as Column[]
	},
	layout: {
		where: 'deviceAccount',
		default: [['a'], ['b']] as Column['id'][][]
	},
	columnAlign: {
		where: 'deviceAccount',
		default: 'left' as 'left' | 'right' | 'center'
	},
	alwaysShowMainColumn: {
		where: 'deviceAccount',
		default: true
	},
	navWindow: {
		where: 'deviceAccount',
		default: true
	},
	columnMargin: {
		where: 'deviceAccount',
		default: 16
	},
	columnHeaderHeight: {
		where: 'deviceAccount',
		default: 42
	},
}));

export function addColumn(column: Column) {
	if (column.name == undefined) column.name = null;
	deckStore.push('columns', column);
	deckStore.push('layout', [column.id]);
}

export function removeColumn(id: Column['id']) {
	deckStore.set('columns', deckStore.state.columns.filter(c => c.id !== id));
	deckStore.set('layout', deckStore.state.layout
		.map(ids => ids.filter(_id => _id !== id))
		.filter(ids => ids.length > 0));
}

export function swapColumn(a: Column['id'], b: Column['id']) {
	const aX = deckStore.state.layout.findIndex(ids => ids.indexOf(a) != -1);
	const aY = deckStore.state.layout[aX].findIndex(id => id == a);
	const bX = deckStore.state.layout.findIndex(ids => ids.indexOf(b) != -1);
	const bY = deckStore.state.layout[bX].findIndex(id => id == b);
	const layout = copy(deckStore.state.layout);
	layout[aX][aY] = b;
	layout[bX][bY] = a;
	deckStore.set('layout', layout);
}

export function swapLeftColumn(id: Column['id']) {
	const layout = copy(deckStore.state.layout);
	deckStore.state.layout.some((ids, i) => {
		if (ids.includes(id)) {
			const left = deckStore.state.layout[i - 1];
			if (left) {
				layout[i - 1] = deckStore.state.layout[i];
				layout[i] = left;
				deckStore.set('layout', layout);
			}
			return true;
		}
	});
}

export function swapRightColumn(id: Column['id']) {
	const layout = copy(deckStore.state.layout);
	deckStore.state.layout.some((ids, i) => {
		if (ids.includes(id)) {
			const right = deckStore.state.layout[i + 1];
			if (right) {
				layout[i + 1] = deckStore.state.layout[i];
				layout[i] = right;
				deckStore.set('layout', layout);
			}
			return true;
		}
	});
}

export function swapUpColumn(id: Column['id']) {
	const layout = copy(deckStore.state.layout);
	const idsIndex = deckStore.state.layout.findIndex(ids => ids.includes(id));
	const ids = copy(deckStore.state.layout[idsIndex]);
	ids.some((x, i) => {
		if (x === id) {
			const up = ids[i - 1];
			if (up) {
				ids[i - 1] = id;
				ids[i] = up;

				layout[idsIndex] = ids;
				deckStore.set('layout', layout);
			}
			return true;
		}
	});
}

export function swapDownColumn(id: Column['id']) {
	const layout = copy(deckStore.state.layout);
	const idsIndex = deckStore.state.layout.findIndex(ids => ids.includes(id));
	const ids = copy(deckStore.state.layout[idsIndex]);
	ids.some((x, i) => {
		if (x === id) {
			const down = ids[i + 1];
			if (down) {
				ids[i + 1] = id;
				ids[i] = down;

				layout[idsIndex] = ids;
				deckStore.set('layout', layout);
			}
			return true;
		}
	});
}

export function stackLeftColumn(id: Column['id']) {
	let layout = copy(deckStore.state.layout);
	const i = deckStore.state.layout.findIndex(ids => ids.includes(id));
	layout = layout.map(ids => ids.filter(_id => _id !== id));
	layout[i - 1].push(id);
	layout = layout.filter(ids => ids.length > 0);
	deckStore.set('layout', layout);
}

export function popRightColumn(id: Column['id']) {
	let layout = copy(deckStore.state.layout);
	const i = deckStore.state.layout.findIndex(ids => ids.includes(id));
	layout = layout.map(ids => ids.filter(_id => _id !== id));
	layout.splice(i + 1, 0, [id]);
	layout = layout.filter(ids => ids.length > 0);
	deckStore.set('layout', layout);
}

export function addColumnWidget(id: Column['id'], widget: ColumnWidget) {
	const columns = copy(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex(c => c.id === id);
	const column = copy(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	if (column.widgets == null) column.widgets = [];
	column.widgets.unshift(widget);
	columns[columnIndex] = column;
	deckStore.set('columns', columns);
}

export function removeColumnWidget(id: Column['id'], widget: ColumnWidget) {
	const columns = copy(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex(c => c.id === id);
	const column = copy(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = column.widgets.filter(w => w.id != widget.id);
	columns[columnIndex] = column;
	deckStore.set('columns', columns);
}

export function setColumnWidgets(id: Column['id'], widgets: ColumnWidget[]) {
	const columns = copy(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex(c => c.id === id);
	const column = copy(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = widgets;
	columns[columnIndex] = column;
	deckStore.set('columns', columns);
}

export function updateColumnWidget(id: Column['id'], widgetId: string, data: any) {
	const columns = copy(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex(c => c.id === id);
	const column = copy(deckStore.state.columns[columnIndex]);
	if (column == null) return;
	column.widgets = column.widgets.map(w => w.id === widgetId ? {
		...w,
		data: data
	} : w);
	columns[columnIndex] = column;
	deckStore.set('columns', columns);
}

export function updateColumn(id: Column['id'], column: Partial<Column>) {
	const columns = copy(deckStore.state.columns);
	const columnIndex = deckStore.state.columns.findIndex(c => c.id === id);
	const currentColumn = copy(deckStore.state.columns[columnIndex]);
	if (currentColumn == null) return;
	for (const [k, v] of Object.entries(column)) {
		currentColumn[k] = v;
	}
	columns[columnIndex] = currentColumn;
	deckStore.set('columns', columns);
}
