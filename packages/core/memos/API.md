## 要件

* 変更のあったフィールドにのみバリデーション再評価が掛かる
* 配列を素直に取り扱える(追加のラッパーとかいろいろ必要ない)
    * ただし、最適化のための追加の道具立てを提供することはあり得る、とする

## basic usage

```ts
export const {FormProvider, useField, useFormState, useArrayFieldRenderer} = createForm<ValuesType>({
  s: 'some string',
  b: true,
  n: 3,
  a: [
    2,3,4
  ],
  o: {
    ns: 'nested string',
    nb: false,
  },
  ao: [
    {
      ans: 'array nested string',
      ann: 120
    },
    {
      ans: 'array nested string 2',
      ann: 200,
    }
  ]
})
```

```ts
const {value, setValue, error} = useField((values) => values.s)

const {value, setValue, error} = useField((values) => values.a[1])

const {value, setValue, error} = useField((values) => values.ao[1].ans)
```

```tsx
const {value: objectArray} = useField((values) => values.ao)

<div>
  {objectArray.map((_, i) => <ObjectEditor key={i} index={i} />)}
</div>

const ObjectEditor = ({index}) => {
  const {value, setValue, error} = useField((values) => values.ao[index].ans)

  return <input value={value} onChange={(ev) => setValue(ev.target.value)} />
}
// ao が上記コンポーネント以外の場所で更新されたときでも、期待通りにコンポーネントはレンダリングされる
```