import { state, effect } from './state'
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends Ref<infer U> ? DeepReadonly<U> : T[P];
};
export const defineStore = <T extends {}>(fn: () => T): DeepReadonly<T> => {
    const store: Record<string, any> = state({});
    const res = fn();
    for (const p in res) {
        let item = res[p];
        if (item instanceof Ref) {
            effect(() => {
                store[p] = (<Ref<any>>item).value;
            }, {
                sync: true
            })
        } else {
            store[p] = item;
        }
    }
    return store as DeepReadonly<T>;
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
    }, {
        sync: true
    });
    return value as Ref<T>;
}