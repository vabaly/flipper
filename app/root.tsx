import type { MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { Provider as StyletronProvider } from 'styletron-react'
import { LightTheme, BaseProvider } from 'baseui'

import { styletron } from './config/styletron'
import Layout from './components/Layout'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Phala SDK Example',
  description: 'Phala SDK Example',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <StyletronProvider value={styletron}>
          <BaseProvider theme={LightTheme}>
            <Layout>
              <Outlet />
            </Layout>
          </BaseProvider>
        </StyletronProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
