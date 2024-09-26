import { computed, defineStore, effect, ref } from "../src";

const store = defineStore(() => {
    const state = ref({
        number: 1,
        string: 'a'
    })
    // const addNumber = () => {
    //     state.value.number = 4;
    // }

    return {
        // addNumber,
        state
    }
})

// effect(() => {
//     // console.log('getNumber', store.getNumber());
//     // console.log('number', store.number);
// })
// effect(() => {
//     console.error('number', store.state.number);
// })

// store.addNumber();