const PROXY_MAP = new WeakMap();
const WATCH_MAP = new WeakMap<Task, Dep[]>();

type FN = () => void
type Task = EffectTask;
const globalTask: Task[] = [];

class Dep {
	list = new Set<Task>();

	add(task: Task) {
		if (this.list.has(task)) {
			return;
		}

		this.list.add(task)
		bindWatch(task, this);
	}

	notify() {
		this.list.forEach(job);
	}
}
const job = (task: Task) => {
	task.register();
}
const isString = (val: unknown) => {
	return typeof val === 'string';
}
const isObject = (target: unknown) => {
	return typeof target === 'object';
}
const isArray = Array.isArray;

const isIntegerKey = (key: unknown) => {
	return isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key
}

const IS_REACTIVE = Symbol('IS_REACTIVE');

const createReactive = <T extends object>(data: T): T => {
	if (Reflect.get(data, IS_REACTIVE)) {
		return data;
	}
	let mate = PROXY_MAP.get(data);
	if (mate) {
		return mate.proxy;
	}

	const proxy = new Proxy(data, {
		get(target, key, receiver) {
			if (key === IS_REACTIVE) {
				return true;
			}
			let dep = mate.data[key];
			if (!dep) {
				dep = mate.data[key] = new Dep();
			}
			const gt = getActiveGlobalTask();
			if (gt) {
				dep.add(gt)
			}
			const res = Reflect.get(target, key, receiver);
			if (isObject(res)) {
				return createReactive(res as object)
			}
			return res;
		},
		set(target, key, value, recevier) {
			const dep = mate.data[key];

            // 处理数组，设置length
			if (isArray(target) && key === 'length') {
				const oldLen = target.length;
				const newLen = value;
                if(oldLen !== newLen) {
                    const min = Math.min(oldLen, newLen);
                    const max = Math.max(oldLen, newLen);
                    const keys = Object.keys(mate.data);
                    keys.forEach(key => {
                        if (isIntegerKey(key)) {
                            const index = Number(key);
                            if (index >= min && index < max) {
                                const dep = mate.data[key];
                                if (dep) {
                                    dep.notify();
                                }
                            }
                        }
                    })
                }
			}

			Reflect.set(target, key, value, recevier);

			if (dep) {
				dep.notify();
			}
			return true;
		}
	})

	mate = {
		proxy,
		data: Object.create(null)
	}
	PROXY_MAP.set(data, mate);

	return proxy;
}

class EffectTask {
	count = 1;
	isValid = true;
	sync = false;

	task: FN;

	constructor(task: FN) {
		this.task = task;
	}

	register() {
		this.count ++
		if (this.sync) {
			this.run()
		} else {
			queueMicrotask(() => this.run())
		}
	}

	run() {
		if (!this.isValid) {
			return;
		}

		this.count --;
		if (this.count === 0) {
			globalTaskPush(this);
			this.task();
			globalTaskPop();
		}
	}
	destory() {
		this.isValid = false;
		cleanupWatch(this)
	}
}

const cleanupWatch = (task: Task) => {
	const deps = WATCH_MAP.get(task);
	if (deps) {
		deps.forEach(dep => dep.list.delete(task));
	}
}

const bindWatch = (task: Task, dep: Dep) => {
	let deps = WATCH_MAP.get(task);
	if (!deps) {
		WATCH_MAP.set(task, deps = []);
	}
	deps.push(dep);
}

/**
 * 推入一个即将执行的任务
 * @param task 
 */
const globalTaskPush = (task: Task) => {
	globalTask.push(task);
}

/**
 * 获取当前正在执行的任务
 * @returns 
 */
const getActiveGlobalTask = () => {
	return globalTask.length && globalTask[globalTask.length - 1];
}

/**
 * 移除已经执行完成的任务
 */
const globalTaskPop = () => {
	globalTask.pop();
}

type EffectOptions = {
	sync?: boolean
}

export const state = createReactive;
export const effect = (fn: FN, options: EffectOptions = {}) => {
	const task = new EffectTask(fn);
	task.sync = !!options.sync;
	task.run();

	const cleanup = () => {
		task.destory();
	}
	return cleanup;
}

export const batchEffect = () => {
    const list: FN[] = [];
    return {
        list,
        effect(fn: FN) {
            const stop = effect(fn);
            list.push(stop);
            return stop;
        },
        clear() {
            list.forEach(val => val())
            list.length = 0;
        }
    }
}
