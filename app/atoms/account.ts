import {atomWithStorage} from 'jotai/utils'
import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'

// 持久化存储账户信息
const accountAtom = atomWithStorage<InjectedAccountWithMeta | null>(
  'atom:account',
  null
)

export default accountAtom
