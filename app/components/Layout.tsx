import type { FC, ReactNode } from 'react'
import { Link, useMatches } from '@remix-run/react'
import { HeadingXLarge } from 'baseui/typography'
import { ToasterContainer } from 'baseui/toast'
import { Block } from 'baseui/block'
import { ChevronLeft } from 'baseui/icon'
// import AccountSelect from './AccountSelect'
// import useIsClient from '../hooks/useIsClient'

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const matches = useMatches()

  const lastMatch = matches[matches.length - 1]
  const title = lastMatch?.handle?.title || 'Phala SDK Example'

  return (
    <Block width="100%" maxWidth="768px" margin="0 auto" padding="0 16px 24px">
      <Block
        as="header"
        height="120px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Block display="flex" alignItems="center">
          {lastMatch.pathname !== '/' && (
            <Link to="/">
              <ChevronLeft
                size={36}
                overrides={{
                  Svg: {
                    style: {
                      marginLeft: '-12px',
                    },
                  },
                }}
              />
            </Link>
          )}
          <HeadingXLarge as="div">{title}</HeadingXLarge>
        </Block>
      </Block>

      <main>{children}</main>

      <ToasterContainer
        placement="topRight"
        autoHideDuration={3000}
        overrides={{ToastBody: {style: {wordBreak: 'break-all'}}}}
      />
    </Block>
  )
}

export default Layout
