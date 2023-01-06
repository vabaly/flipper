/**
 * @file 合约交互实例生成器
 */
import { useRef } from 'react'
import type { FC } from 'react'
import type { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import type { InputProps } from 'baseui/input'
import { Textarea } from 'baseui/textarea'
import { Button } from 'baseui/button'
import { toaster } from 'baseui/toast'
import { useAtom } from 'jotai'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage } from 'jotai/utils'
import { create } from '@phala/sdk'

import { createApi } from '../lib/polkadotApi'
import useIsClient from '../hooks/useIsClient'

const defaultEndpoint = 'ws://localhost:9944'
const defaultPruntimeURL = 'http://localhost:8000'

// 持久化存储服务器端点
const endpointAtom = atomWithStorage<string>(
  // storage key
  'atom:endpoint',
  // default storage value
  defaultEndpoint,
)
// 持久化存储 pruntime_url，此 url 通过 http 形式与后端的 rpc 接口交互
const pruntimeURLAtom = atomWithStorage<string>(
  'atom:pruntime_url',
  defaultPruntimeURL,
)

// 持久化存储合约信息，可以存多份合约数据，但是每次 ContractLoader 都会通过 name 属性读取其中一份
const contractsAtom = atomWithStorage<
  Record<string, {contractId: string; metadata: string}>
>('atom:contracts', {})

// 输入框内容统一设置 monospace 字体
const inputOverrides: InputProps['overrides'] = {
  Input: {
    style: {
      fontFamily: 'monospace',
    },
  },
}

const ContractLoader: FC<{
  // 读取哪一份合约数据
  name: string
  // 合约交互实例生成器最主要的一环就是通过 onLoad 函数将 链的连接实例与合约交互实例 给传到父组件上去使用
  onLoad: (res: {api: ApiPromise; contract: ContractPromise}) => void
}> = ({name, onLoad}) => {

  // 要连接的服务器端点
  const [endpoint, setEndpoint] = useAtom(endpointAtom)
  // 要进行 http 通信的 url
  const [pruntimeURL, setPruntimeURL] = useAtom(pruntimeURLAtom)

  // contractInfoAtom.current 是个 atom 实例
  const contractInfoAtom = useRef(
    focusAtom(contractsAtom, (optic) => optic.prop(name))
  )
  // contractInfo 原本是 contractInfoAtom.current 对应的 atom 实例状态
  // setContractInfo 也会改变 contractInfoAtom.current 对应的 atom 实例状态
  // 改变后，contractInfoAtom.current 引用的 atom 实例状态也就发生改变
  // 又因为 contractInfoAtom.current 引用的 atom 实例本身会跟着 contractsAtom 变化
  // 所以 contractInfoAtom 引用的 atom 既能被父 atom 影响，又能自身改变？
  // TODO: 这里要做个实验，contractsAtom 是不是会因为派生 atom 改变而被改变，因为从来没改变过 contractsAtom，所以不明白这么写的含义
  const [contractInfo, setContractInfo] = useAtom(contractInfoAtom.current)

  const {contractId = '', metadata = ''} = contractInfo || {}

  const isClient = useIsClient()
  if (!isClient) return null

  // 点击提交按钮时会创建到链上的连接，并且生成合约交互实例
  const loadContract = async () => {
    try {
      const api = await createApi(endpoint)
      // 创建一个与链上合约进行交互的实例
      const contract = new ContractPromise(
        // 扩展一下 api
        (await create({api, baseURL: pruntimeURL, contractId, autoDeposit: false })).api,
        // 元数据
        JSON.parse(metadata),
        // 链的地址
        contractId
      )
      // onLoad 是外面传进来的方法
      onLoad({api, contract})
      // 合约加载成功
      toaster.positive('Contract loaded successfully', {})
    } catch (err) {
      toaster.negative((err as Error).message, {})
      throw err
    }
  }

  return (
    <>
      <FormControl label="WS Endpoint">
        <Input
          placeholder={defaultEndpoint}
          overrides={inputOverrides}
          value={endpoint}
          onChange={(e) => setEndpoint(e.currentTarget.value)}
        ></Input>
      </FormControl>
      <FormControl label="Pruntime URL">
        <Input
          placeholder={defaultPruntimeURL}
          overrides={inputOverrides}
          value={pruntimeURL}
          onChange={(e) => setPruntimeURL(e.currentTarget.value)}
        ></Input>
      </FormControl>
      <FormControl label="Contract Id">
        <Input
          overrides={inputOverrides}
          value={contractId}
          onChange={(e) =>
            // 合并新的合约 id 和原来的合约数据
            setContractInfo((contractInfo) => ({
              ...contractInfo,
              contractId: e.currentTarget.value,
            }))
          }
        ></Input>
      </FormControl>
      <FormControl
        // ABI 就是调用合约函数时需要传的数据，这份数据也可称为是 metadata（元数据）
        label="ABI"
      >
        <Textarea
          overrides={{
            Input: {
              style: {
                fontFamily: 'monospace',
                height: '600px',
              },
            },
          }}
          value={metadata}
          onChange={(e) =>
            setContractInfo((contractInfo) => ({
              ...contractInfo,
              metadata: e.currentTarget.value,
            }))
          }
        ></Textarea>
      </FormControl>

      <Button disabled={!contractId || !metadata} onClick={loadContract}>
        Load Contract
      </Button>
    </>
  )
}

export default ContractLoader
