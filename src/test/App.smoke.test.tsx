import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

beforeAll(() => {
  // sandbox mode: fetch 실패 → role='FAN' 자동 설정
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
  vi.stubGlobal('EventSource', vi.fn().mockImplementation(() => ({
    onmessage: null,
    onerror: null,
    close: vi.fn(),
  })))
})

describe('App (sandbox)', () => {
  it('FANDROPS 헤더가 렌더링된다', () => {
    render(<App />)
    expect(screen.getByText('FANDROPS')).toBeInTheDocument()
  })

  it('인기 드롭 섹션이 존재한다', async () => {
    render(<App />)
    expect(await screen.findByText('인기 드롭')).toBeInTheDocument()
  })
})