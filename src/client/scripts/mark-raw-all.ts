import { markRaw } from "vue";

export const markRawAll = (...obj: any[]) => {
	obj.forEach(markRaw);
}
