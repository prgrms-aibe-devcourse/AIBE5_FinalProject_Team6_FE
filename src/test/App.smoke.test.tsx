import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

beforeAll(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  vi.stubGlobal('EventSource', vi.fn().mockImplementation(() => ({
    onmessage: null,
    onerror: null,
    close: vi.fn(),
  })))
})

describe('App', () => {
  it('FANDROPS 헤더가 렌더링된다', () => {
    window.history.pushState({}, '', '/fan')
    render(<App />)
    expect(screen.getAllByText('FANDROPS').length).toBeGreaterThan(0)
  })

  it('로그인 페이지가 렌더링된다', async () => {
    window.history.pushState({}, '', '/fan')
    render(<App />)
    const loginButton = screen.getByRole('button', { name: /로그인/ })
    loginButton.click()
    expect(await screen.findByText('카카오로 1초 로그인')).toBeInTheDocument()
  })
})
