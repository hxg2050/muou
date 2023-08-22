type FN = () => void;

const DEP_WEAK_MAP = new WeakMap<any, Dep[]>();
let TARGET: any[] = [];

class Dep {
    static target: any;
    list: any[] = [];
    timeout?: NodeJS.Timeout;
    add(cb: any[]) {
        if (this.has(cb)) {
            return;
        }
        this.list.push(cb);
    }
    has(val: any) {
        return this.list.indexOf(val) != -1;
    }

    notify() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.list.forEach(value => {
                TARGET.push(value);
                value();
                TARGET.pop();
            });
        });
    }
}

function observe<T extends Record<string, any>>(data: T) {
    if (!data || 'object' !== typeof data) return data;

    let keys = Reflect.ownKeys(data) as (keyof T)[];
    for (let key of keys) {
        data[key] = observe(data[key]);
    }
    return new Observe(data).data;
}

/**
 * 观察数据
 */
class Observe<T extends Record<string, any>> {
    dep: Map<string|symbol, Dep> = new Map();
    data: T;
    constructor(data: T) {
        this.data = this.proxy(data)
    }
    /**
     * 代理对象
     * @param data 
     * @returns 
     */
    private proxy(data: T) {
        let dep = this.dep;
        return new Proxy(data, {
            get(target, key, receiver) {
                if (TARGET.length > 0) {
                    if (!dep.has(key)) {
                        dep.set(key, new Dep());
                    }

                    dep.get(key)!.add(TARGET[TARGET.length - 1]);
                    const values = DEP_WEAK_MAP.get(TARGET[TARGET.length - 1])!;
                    values.push(dep.get(key)!);
                }

                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                const oldValue = Reflect.get(target, key);
                // 是数组，且key === length
                // console.log('set', target, key, value);
                if (oldValue === value) {
                    // 无变化不做任何处理
                    if (!(Array.isArray(target) && key === 'length')) {
                        return true;
                    }
                }
                // console.log(typeof oldValue, oldValue);
                if (typeof oldValue === "number") {
                    // 数字类型再次强转一次，预防出现数字类型变成字符串类型
                    value = Number(value);
                }

                // if (!Reflect.has(target, key)) {
                    // console.log("新值");
                // }
                if ('object' === typeof value) {
                    value = observe(value);
                }

                Reflect.set(target, key, value, receiver);
                dep.get(key)?.notify();
                return true;
            }
        });
    }
}

/**
 * 需要监听数据变化，然后处理对应回调函数
 */
class SE<T extends {}> {
    data: T;

    constructor(data: T) {
        this.data = observe(data);
    }

    effect(fn: FN) {
        TARGET.push(fn);
        DEP_WEAK_MAP.set(fn, []);
        fn();
        TARGET.pop();
        return function() {
            const values = DEP_WEAK_MAP.get(fn);
            values!.forEach(val => {
                const index = val.list.indexOf(fn);
                val.list.splice(index, 1);
            });
        }
    }

    // private watch(keys: FN, fn: FN) {

    // }
}

export const state = <T extends {}>(data: T) => {
    return observe(data)
}

export const effect = (fn: FN) => {
    TARGET.push(fn);
    DEP_WEAK_MAP.set(fn, []);
    fn();
    TARGET.pop()
    return () => {
        const values = DEP_WEAK_MAP.get(fn);
        values!.forEach(val => {
            const index = val.list.indexOf(fn);
            val.list.splice(index, 1);
        });
    }
}

export type Props<T> = {
    [P in keyof T]?: Props<T[P]> | (() => Props<T[P]>);
};
/**
 * 快速设置
 * @param obj 
 * @param props 
 */
export function setProps<T>(obj: T, props: Props<T>) {
	for (let key in props) {
		const value = props[key];
		if (typeof value === 'object') {
			setProps(obj[key], value!);
			continue;
		}

        effect(() => {
		    obj[key] = typeof value === 'function' ? value() : value! as any
        })
	}
}


export function muou<T extends {}>(data: T) {
    return new SE(data);
}