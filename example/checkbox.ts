import { effect } from "../src";
export const checkbox = (props: any) => {
    const root = document.createElement('div')
    const cb = root.appendChild(document.createElement('input'));
    const span = root.appendChild(document.createElement('span'))
    cb.type="checkbox"
    effect(() => {
        cb.checked = props.checked;
        span.textContent = props.checked;
    })
    cb.addEventListener('click', (e) => {
        e.preventDefault();
    }, false);
    root.addEventListener('click', () => {
        props.checked = !props.checked;
    })
    return root;
}