import '@testing-library/jest-dom'

// jsdom에서 미구현된 DOM API mock
window.HTMLElement.prototype.scrollIntoView = function () {}