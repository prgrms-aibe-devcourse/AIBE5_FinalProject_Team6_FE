import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

beforeAll(() => {
  // sandbox mode: fetch 실패 → isSandbox=true 자동 설정
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

  it('아티스트 스토어 섹션이 존재한다', () => {
    render(<App />)
    expect(screen.getByText('아티스트 스토어')).toBeInTheDocument()
  })
})