import type { MetaFunction } from '@remix-run/node'
import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { Button } from 'baseui/button'
import { ButtonGroup } from 'baseui/button-group'
import { toaster } from 'baseui/toast'
import type { ApiPromise } from '@polkadot/api'
import type { ContractPromise } from '@polkadot/api-contract'
import { signCertificate } from '@phala/sdk'
import type { CertificateData } from '@phala/sdk'

import ContractLoader from '../components/ContractLoader'
import accountAtom from '../atoms/account'
import { getSigner } from '../lib/polkadotExtension'

const PAGE_TITLE = 'Flipper'
const PAGE_TITLE_DESCRIBE = {
  title: PAGE_TITLE,
}

export const meta: MetaFunction = () => ({
  ...PAGE_TITLE_DESCRIBE,
})

export const handle = {
  ...PAGE_TITLE_DESCRIBE,
}

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

  // TODO: 根据认证信息获取什么东西
  const onQuery = async () => {
    if (!certificateData || !contract) return
    const {output} = await contract.query.get(certificateData as any, {})
    console.log(output?.toHuman())
    toaster.info(JSON.stringify(output?.toHuman()), {})
  }

  const onCommand = async () => {
    if (!contract || !account || !certificateData) return
    const signer = await getSigner(account)

    const {gasRequired, storageDeposit} = await contract.query.flip(
      certificateData as any,
      {}
    )

    const options = {
      // value: 0,
      gasLimit: (gasRequired as any).refTime,
      storageDepositLimit: storageDeposit.isCharge
        ? storageDeposit.asCharge
        : null,
    }

    contract.tx
      .flip(options)
      .signAndSend(account.address, {signer}, (status) => {
        console.log('status', status)
        if (status.isInBlock) {
          toaster.positive('In Block', {})
        }
        if (status.isCompleted) {
          toaster.positive('Completed', {})
        }
      })
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
