import type {InjectedAccountWithMeta} from '@polkadot/extension-inject/types'
import type {Signer} from '@polkadot/types/types'

// 缓存一下，避免多次点击重复生成
let enablePolkadotExtensionCache: Promise<void>
export const enablePolkadotExtension = async (): Promise<void> => {
  if (enablePolkadotExtensionCache) return enablePolkadotExtensionCache

  enablePolkadotExtensionCache = (async () => {
    const {web3Enable} = await import('@polkadot/extension-dapp')
    // TODO: 在 PolkadotExtension 生效后启用？
    const extensions = await web3Enable('Phala SDK Example')

    if (extensions.length === 0) {
      throw new Error(
        'No extension installed, or the user did not accept the authorization'
      )
    }
  })()

  return enablePolkadotExtensionCache
}

// TODO: 获取认证令牌？
export const getSigner = async (
  account: InjectedAccountWithMeta
): Promise<Signer> => {
  await enablePolkadotExtension()
  // 检索页面上的 providers
  const {web3FromSource} = await import('@polkadot/extension-dapp')
  const injector = await web3FromSource(account.meta.source)
  const signer = injector.signer

  return signer
}
