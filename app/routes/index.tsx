import { Link } from '@remix-run/react'
import {ListItem, ListItemLabel} from 'baseui/list'
// import {StyledLink} from 'baseui/link'

const LINKS: [string, string][] = [
  ['/flipper', 'Flipper'],
]

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <ol>
        {LINKS.map(([href, label], index) => (
          <ListItem
            key={label}
            artwork={() => <div>{index + 1}</div>}
          >
            <ListItemLabel>
              <Link to={href}>
                {/* <StyledLink>{label}</StyledLink> */}
                {label}
              </Link>
            </ListItemLabel>
          </ListItem>
        ))}
      </ol>
    </div>
  )
}
