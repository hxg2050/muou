# 提线木偶

[![publish](https://github.com/hxg2050/muou/actions/workflows/publish.yml/badge.svg)](https://github.com/hxg2050/muou/actions/workflows/publish.yml)
[![npm-downloads](https://img.shields.io/npm/dm/muou.svg)](https://www.npmjs.com/package/muou)
[![npm-version](https://img.shields.io/npm/v/muou.svg)](https://www.npmjs.com/package/muou)  

可方便快捷的创建数据之间的变化响应，当数据发生变化时自动执行相关逻辑。
比如在更新视图时非常有用，只需要建立好视图与数据之间的关系。后面不再关心视图，而只需要处理好数据即可实现自动更新视图。
`注意：考虑性能方面采用了宏任务处理effect，所以当数据在同一时刻发生频繁改变，effect只会执行一次`
# 安装

```sh
npm install muou
```

```sh
yarn add muou
```

### 快速上手

```ts
import { state, effect } from 'muou';

// 初始化一个可检测式数据
const store = state({
    value: {},
    step: 1
});
// 当effect内数据发生变化时触发
const stopEffect = effect(() => {
    if (store.data.step == 2) {
        console.log(store.data.value);
    }
});
// 通过store.data获取数据
store.data.step ++;
// 直接修改引用
store.data.value = {a: 1};
// 当传入错误类型时自动转换成正确类型
store.data.value = '2' as any;
// 可在任何时刻，任何位置修改数据
setTimeout(() => {
    store.data.step = 1;
    store.data.value = {a: 2};
    // 停止数据响应
    stopEffect();
}, 1000);
```

### 状态管理
```ts
import { defineStore, ref, computed } from 'muou';

export default defineStore('user', () => {
    const id = ref(0);
    const username = ref('');

    const login = async (uname: string, password: string) => {
        id.value = 1000;
        username.value = uname;
        return data;
    }

    // 计算属性
    const idname = computed(() => {
        return id.value + username.value
    });

    return {
        id,
        username,
        idname,
        login
    };
});
```
其他地方使用状态
```ts
import user from './user';

effect(() => {
    console.log(user.idname);
})
// 模拟调用登陆方法
user.login('username', '123456');
```