/**
 * @see https://github.com/mswjs/msw/issues/355
 */
import fetch from 'node-fetch'
import axios from 'axios'
import { RequestInterceptor } from '../../src'
import withDefaultInterceptors from '../../src/presets/default'

let interceptor: RequestInterceptor

beforeAll(() => {
  interceptor = new RequestInterceptor(withDefaultInterceptors)
  interceptor.use(() => {
    throw new Error('Custom error message')
  })
})

afterAll(() => {
  interceptor.restore()
})

test('propagates a custom error message to the fetch request error', () => {
  fetch('https://test.mswjs.io').catch((error) => {
    expect(error).toHaveProperty(
      'message',
      'request to https://test.mswjs.io/ failed, reason: Custom error message'
    )
  })
})

test('causes a Network Error when using axios', () => {
  axios.get('https://test.mswjs.io').catch((error) => {
    /**
     * axios always treats request exceptions with the fixed "Network Error" message.
     * @see https://github.com/axios/axios/issues/383
     */
    expect(error).toHaveProperty('message', 'Network Error')
  })
})
