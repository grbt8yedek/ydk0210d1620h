import { render, screen } from '@testing-library/react'
import ServiceButtons from '@/components/ServiceButtons'

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe('ServiceButtons Component', () => {
  it('should render all service buttons', () => {
    render(<ServiceButtons />)
    expect(screen.getAllByText(/Check/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/PNR/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/İptal/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Yardım/i).length).toBeGreaterThan(0)
  })

  it('should have correct links', () => {
    const { container } = render(<ServiceButtons />)
    const links = container.querySelectorAll('a')
    const hrefs = Array.from(links).map(link => link.getAttribute('href'))
    
    expect(hrefs).toContain('/check-in')
    expect(hrefs).toContain('/pnr-sorgula')
    expect(hrefs).toContain('/bilet-iptal')
    expect(hrefs).toContain('/yardim')
  })

  it('should render desktop version', () => {
    const { container } = render(<ServiceButtons />)
    const desktop = container.querySelector('.hidden.sm\\:block')
    expect(desktop).toBeInTheDocument()
  })

  it('should render mobile version', () => {
    const { container } = render(<ServiceButtons />)
    const mobile = container.querySelector('.grid-cols-2')
    expect(mobile).toBeInTheDocument()
  })
})

