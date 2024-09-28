import { batchEffect, computed, defineStore, effect, ref } from "../src";

describe('Core', () => {
    test('main', (done) => {


        const testStore = defineStore(() => {
            
            const store = ref({
                id: 1,
                obj: {
                    number: 1
                },
                other: 'a',
                arr: [{
                    value: 1
                }, {
                    value: 2
                }]
            });
            store.value.arr.length = 2;

            const step = ref(0);

            const uname = computed(() => {
                return `name:${store.value.other}`
            })
            const arrFn = () => {
                return `arr:${store.value.arr.map(val => val.value).join(',')}`
            }

            const setOther = (name: string) => {
                store.value.other = name;
            }

            const nextStep = () => {
                step.value ++;
            }
            const setId = (id: number) => {
                store.value.id = id;
            }
            return {
                uname,
                arrFn,
                setOther,
                nextStep,
                setId,
                store,
                step
            }
        })

        const bf = batchEffect();
        bf.effect(() => {
            if (testStore.step === 0) {
                expect(testStore.uname).toBe('name:a');
                expect(testStore.arrFn()).toBe('arr:1,2');
                expect(testStore.store.obj.number).toBe(1);
                expect(testStore.store.other).toBe('a');
                expect(testStore.store.arr.join(',')).toBe('[object Object],[object Object]');
            } else if (testStore.step === 1) {
                expect(testStore.uname).toBe('name:b');
                expect(testStore.store.arr.join(',')).toBe('');
                done();
                testStore.nextStep();
                bf.clear();
            }
            effect(() => {
                expect(testStore.store.id).toBeLessThan(3);
            })
        })

        setTimeout(() => {
            testStore.setOther('b');
            testStore.store.arr.length = 0;
            testStore.nextStep();
            testStore.setId(2);
        })
        
    });
})