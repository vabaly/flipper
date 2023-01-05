import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { Button } from 'baseui/button'
import { ButtonGroup } from 'baseui/button-group'
import { toaster } from 'baseui/toast'
import type { ApiPromise } from '@polkadot/api'
import type { ContractPromise } from '@polkadot/api-contract'
import { CertificateData } from '@phala/sdk'

import ContractLoader from '../components/ContractLoader'
import accountAtom from '../atoms/account'

const Flipper = () => {
  // 与链的服务器连接的 API
  const [api, setApi] = useState<ApiPromise>()
  // 与链上合约交互的实例
  const [contract, setContract] = useState<ContractPromise>()

  // 账户认证信息
  const [certificateData, setCertificateData] = useState<CertificateData>()

  // 获取账户信息，此信息无需设置？由浏览器扩展来设置吗？
  const [account] = useAtom(accountAtom)

  // 离开页面时断开 API 连接
  useEffect(
    () => () => {
      api?.disconnect()
    },
    [api]
  )

  // 每当账号发生变化，账户认证信息就重置
  useEffect(() => {
    setCertificateData(undefined)
  }, [account])

  // 有账号的情况下，点击认证可以开始认证
  const onSignCertificate = async () => {
    if (account && api) {
      try {
        const signer = await getSigner(account)

        // Save certificate data to state, or anywhere else you want like local storage
        setCertificateData(
          await signCertificate({
            api,
            account,
            signer,
          })
        )
        toaster.positive('Certificate signed', {})
      } catch (err) {
        toaster.negative((err as Error).message, {})
      }
    }
  }

  return contract ? (
    <>
      <ButtonGroup>
        <Button disabled={!account} onClick={onSignCertificate}>
          Sign Certificate
        </Button>
        <Button disabled={!certificateData} onClick={onQuery}>
          Get
        </Button>
        <Button disabled={!account} onClick={onCommand}>
          Flip
        </Button>
      </ButtonGroup>
    </>
  ) : (
    // 未生成与链上合约交互的实例，于是需要填充信息，生成一个，这个过程使用一个组件来完成
    <ContractLoader
      name="flipper"
      onLoad={({api, contract}) => {
        setApi(api)
        setContract(contract)
      }}
    />
  )
}

export default Flipper
