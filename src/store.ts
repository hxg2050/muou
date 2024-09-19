import { state, effect } from './state'
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends Ref<infer U> ? DeepReadonly<U> : T[P];
};
const list:Record<string, any> = {};
export const defineStore = <T extends {}>(id: string, fn: () => T): DeepReadonly<T> => {
    if (!list[id]) {
        list[id] = state({});
        const res = fn();
        for (let p in res) {
            let item = res[p];
            if (typeof item === 'function') {
                list[id][p] = item;
            } else if (item instanceof Ref) {
                const data = state(item);
                effect(() => {
                    list[id][p] = data.value;
                });
            }
        }
    }
    return list[id];
}

export class Ref<T> {
    constructor(public value: T|null = null) {

    }
}

export const ref = <T>(value: T) => {
    const data = new Ref(value)
    return state(data);
}

export const computed = <T>(fn: () => T): Ref<T> => {
    let value = ref<T|null>(null);
    effect(() => {
        value.value = fn();
    });
    return value as Ref<T>;
}