import { types as phalaSDKTypes } from '@phala/sdk'
import { khalaDev } from '@phala/typedefs'
import { ApiPromise, WsProvider } from '@polkadot/api'

export const createApi = async (endpoint: string): Promise<ApiPromise> => {
  // 我的理解是链的提供者（服务器），走的是 ws 协议
  // 不传 endpoint，则默认是 ws://127.0.0.1:9944
  const wsProvider = new WsProvider(endpoint)

  // 创建一个 API
  const api = await ApiPromise.create({
    provider: wsProvider,
    types: {
      ...khalaDev,
      ...phalaSDKTypes,
    },
  })

  return api
}
