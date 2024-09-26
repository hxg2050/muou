import { batchEffect, computed, defineStore, ref } from "../src";

describe('Core', () => {
    test('main', (done) => {
        const store = ref({
            value: {
                number: 1
            },
            step: 1,
            other: 'a',
            arr: [1, 2]
        });
        store.value.arr.length = 2;


        const userStore = defineStore(() => {

            const uname = computed(() => {
                return 'name:' + store.value.other
            })
            const arrFn = () => {
                return 'name:' + store.value.arr.join(',')
            }
            return {
                uname,
                arrFn
            }
        })

        const bf = batchEffect();
        bf.effect(() => {
            if (store.value.step === 1) {
                console.log(1);

                expect(userStore.uname).toBe('name:a');
                expect(userStore.arrFn()).toBe('name:1,2');
                expect(store.value.value.number).toBe(1);
            } else if (store.value.step === 2) {
                console.log(2);

                expect(userStore.uname).toBe('name:b');
                expect(store.value.value.number).toBe(2);
            } else if (store.value.step === 3) {
                console.log(3);

                expect(store.value.value.number).toBe(3);
            } else if (store.value.step === 4) {
                console.log(4);

                expect(store.value.value.number).toBe(4);
                bf.clear();
                done();
            }
        })


        setTimeout(() => {
            // 2
            store.value.step++;
            // 值发生变化
            store.value.value.number = 2;
            // 测试值无变化情况
            store.value.value.number = 2;

            store.value.other = 'b';
            setTimeout(() => {

                // 3
                store.value.step++;
                // 当传入错误参数类型时
                store.value.value.number = '3' as any;
                setTimeout(() => {

                    // 4
                    store.value.step++;
                    // 直接修改值引用时
                    store.value.value = {
                        number: 4
                    };
                })
            })
        })

    });
})