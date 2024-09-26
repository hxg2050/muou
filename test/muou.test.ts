import { batchEffect, computed, defineStore, ref } from "../src";

describe('Core', () => {
    test('main', (done) => {


        const userStore = defineStore(() => {
            
            const store = ref({
                id: 1,
                obj: {
                    number: 1
                },
                other: 'a',
                arr: [1, 2]
            });
            store.value.arr.length = 2;

            const uname = computed(() => {
                return `name:${store.value.other}`
            })
            const arrFn = () => {
                return `arr:${store.value.arr.join(',')}`
            }

            const setOther = (name: string) => {
                store.value.other = name;
            }
            return {
                uname,
                arrFn,
                setOther,
                store
            }
        })

        let step = 0;
        const bf = batchEffect();
        bf.effect(() => {
            console.log(step);

            if (step === 0) {
                expect(userStore.uname).toBe('name:a');
                expect(userStore.arrFn()).toBe('arr:1,2');
                expect(userStore.store.obj.number).toBe(1);
                expect(userStore.store.other).toBe('a');
                expect(userStore.store.arr.join(',')).toBe('1,2');
            } else if (step === 1) {
                expect(userStore.uname).toBe('name:b');
                bf.clear();
                done();
            }
            step ++;
        })

        userStore.setOther('b');

    });
})