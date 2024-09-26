import { state, effect } from './state'
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends Ref<infer U> ? DeepReadonly<U> : T[P];
};
export const defineStore = <T extends {}>(fn: () => T): DeepReadonly<T> => {
    const store = state<any>({});
    const res = fn();
    for (let p in res) {
        let item = res[p];
        if (typeof item === 'function') {
            store[p] = item;
        } else if (item instanceof Ref) {
            effect(() => {
                store[p] = item.value;
            });
        }
    }
    return store;
}

export class Ref<T> {
    constructor(public value: T) {

    }
}

export const ref = <T>(value: T) => {
    const data = new Ref(value)
    return state(data);
}

export const computed = <T>(fn: () => T): Ref<T> => {
    let value = ref<T | null>(null);
    effect(() => {
        value.value = fn();
    });
    return value as Ref<T>;
}