import { defineStore, effect, Ref, ref, state } from '../src/index';
import { checkbox } from './checkbox';

// 初始化一个可检测式数据
const store = state({
    value: [{
        checked: true
    }]
});

const forView = (obj: any, template: any) => {
    let oldLength = 0;
    let list: any[] = [];
    effect(() => {
        if (oldLength === obj.length) {
            return;
        }
        if (oldLength < obj.length) {
            // 添加操作
            console.log('添加操作');
            for (let i = oldLength; i < obj.length; i ++) {
                const node = template(i);
                list.push(node);
            }
        } else {
            // 移除操作
            console.log('移除操作');
            const len = oldLength - obj.length;
            for (let i = oldLength - 1; i >= obj.length; i --) {
                list[i].remove()
            }
        }
        oldLength = obj.length;
    })
}

const app = document.querySelector('#app')!;

forView(store.value, (index: number) => {
    const node = checkbox(store.value[index])
    app.append(node)
    return node;
})
setTimeout(() => {
    store.value[0].checked = false
    store.value.push({
        checked: true
    }, {
        checked: false
    });
}, 1000)

const s = defineStore(() => {
    const a = ref(1);
    return {
        a
    };
});

effect(() => {
    console.log(s.a)
})
s.a = 2;
console.log(s.a instanceof Ref);