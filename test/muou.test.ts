import { muou } from "../src";

describe('Core', () => {
    test('main', (done) => {
        const store = muou({
            value: {
                number: 1
            },
            step: 1,
            other: 'a'
        });

        const stopEffect = store.effect(() => {
            // store.data.value.number;
            if (store.data.step === 1) {
                expect(store.data.value.number).toBe(1);
            } else if (store.data.step === 2) {
                expect(store.data.value.number).toBe(2);
            } else if (store.data.step === 3) {
                expect(store.data.value).toBe(3);
            } else if (store.data.step === 4) {
                expect(store.data.value.number).toBe(4);
                stopEffect();
                done();
            }
        });
        // 并未发生监听
        store.data.other = 'b';
        
        store.data.step ++;
        // 值发生变化
        store.data.value.number = 2;
        // 测试值无变化情况
        store.data.value.number = 2;
        store.data.step ++;
        // 当传入错误参数类型时
        store.data.value.number = '3' as any;
        store.data.step ++;
        // 直接修改值引用时
        store.data.value = {
            number: 4
        };
    });
})