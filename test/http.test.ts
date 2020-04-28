/**
 * @jest-enviroment node
 */
import http, { IncomingMessage } from 'http'
import { RequestInterceptor } from '../src'

describe('http', () => {
  let interceptor: RequestInterceptor

  beforeAll(() => {
    interceptor = new RequestInterceptor()
    interceptor.use((req) => {
      if (['http://api.github.com/'].includes(req.url)) {
        return {
          status: 301,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mocked: true }),
        }
      }
    })
  })

  afterAll(() => {
    interceptor.restore()
  })

  describe('given I perform request using http.request', () => {
    let res: IncomingMessage
    let resBody: string = ''

    beforeAll((done) => {
      const req = http.request('http://api.github.com?foo=bar', (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => (resBody += chunk))
        res.on('end', done)
      })

      req.on('response', (original) => (res = original))
      req.end()
    })

    it('should return mocked status code', () => {
      expect(res.statusCode).toEqual(301)
    })

    it('should return mocked headers', () => {
      expect(res.headers).toHaveProperty('content-type', 'application/json')
    })

    it('should return mocked body', () => {
      expect(resBody).toEqual(JSON.stringify({ mocked: true }))
    })
  })

  describe('given I perform request using http.get', () => {
    let res: IncomingMessage
    let resBody: string = ''

    beforeAll((done) => {
      const req = http.get('http://api.github.com', (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => (resBody += chunk))
        res.on('end', done)
      })

      req.on('response', (original) => (res = original))
      req.end()
    })

    it('should return mocked status code', () => {
      expect(res.statusCode).toEqual(301)
    })

    it('should return mocked headers', () => {
      expect(res.headers).toHaveProperty('content-type', 'application/json')
    })

    it('should return mocked body', () => {
      expect(resBody).toEqual(JSON.stringify({ mocked: true }))
    })
  })

  describe('given I restored the original implementation', () => {
    beforeAll(() => {
      interceptor.restore()
    })

    describe('and I perform an HTTP request', () => {
      let resBody: string = ''

      beforeAll((done) => {
        const req = http.get('http://httpbin.org/get', (res) => {
          res.setEncoding('utf8')
          res.on('data', (chunk) => (resBody += chunk))
          res.on('end', done)
        })

        req.end()
      })

      it('should return an original response', () => {
        expect(resBody).toContain(`\"url\": \"http://httpbin.org/get\"`)
      })
    })
  })
})