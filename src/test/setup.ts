import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom에서 미구현된 DOM API mock
window.HTMLElement.prototype.scrollIntoView = function () {}
window.scrollTo = () => {}

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})