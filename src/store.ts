import { state } from './state'
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends Ref<infer U> ? DeepReadonly<U> :  T[P] extends Function ? T[P] : DeepReadonly<T[P]>;
};
export const defineStore = <T extends {}>(fn: () => T): DeepReadonly<T> => {
    const store: Record<string, unknown> = {};
    const res = fn();
    for (const p in res) {
        const item = res[p];
        if (item instanceof Ref) {
            Object.defineProperty(store, p, {
                get() {
                    return (<Ref<any>>item).value;
                }
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
    const data = new Ref(null);
    Object.defineProperty(data, 'value', {
        get() {
            return fn();
        }
    })
    return data as Ref<T>;
}