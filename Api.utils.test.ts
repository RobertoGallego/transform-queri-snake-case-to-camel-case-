import * as testedModule from './Api.utils'

describe('Api utils: ', () => {
  describe('getCSRFToken(): ', () => {
    describe('GIVEN no csrftoken in cookies', () => {
      it('SHOULD return an empty string', () => {
        document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        expect(testedModule.getCSRFToken()).toBe('')
      })
    })

    describe('GIVEN a csrftoken in cookies', () => {
      it('SHOULD return an empty string', () => {
        document.cookie = 'csrftoken=yayimatoken'
        expect(testedModule.getCSRFToken()).toBe('yayimatoken')
      })
    })
  })

  describe('getConfig(): ', () => {
    describe('GIVEN a GET method, a payload, a csrf token and no currentMembershipId in the session storage', () => {
      it('SHOULD return an object with the right properties', () => {
        const method = 'GET'
        const payload = { foo: 'foo' }
        const csrftoken = 'bar'
        document.cookie = `csrftoken=${csrftoken}`
        expect(testedModule.getConfig(method, payload)).toEqual({
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      })

      describe('GIVEN a GET method, a payload, a csrf token and a currentMembershipId in the session storage', () => {
        it('SHOULD return an object with the right properties', () => {
          window.sessionStorage.setItem('currentMembershipId', JSON.stringify(12))
          const method = 'GET'
          const payload = { foo: 'foo' }
          const csrftoken = 'bar'
          document.cookie = `csrftoken=${csrftoken}`
          expect(testedModule.getConfig(method, payload)).toEqual({
            method,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrftoken,
              'Current-Membership': '12',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
          })
        })
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with snake_case properties`, () => {
    it('SHOULD return an object with camelCase properties', () => {
      expect(testedModule.camelCasifyProperties({ foo_bar: 'baz' })).toEqual({
        fooBar: 'baz',
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with ALL_CAPS properties`, () => {
    it('SHOULD return an object with camelCase properties', () => {
      expect(testedModule.camelCasifyProperties({ FOO_BAR: 'baz' })).toEqual({
        fooBar: 'baz',
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with nested objects with snake_case properties
  AND one object is an instance of File`, () => {
    it('SHOULD return an object with camelCase properties', () => {
      const file = new File([], 'file.txt')
      expect(
        testedModule.camelCasifyProperties({
          foo_bar: {
            baz_qux: 'foo',
          },
          new_file: file,
        })
      ).toEqual({
        fooBar: { bazQux: 'foo' },
        newFile: file,
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with nested objects with snake_case properties
  AND some snake_case values`, () => {
    it('SHOULD return an object with camelCase properties, but values are unchanged', () => {
      expect(
        testedModule.camelCasifyProperties({
          foo_bar: {
            baz_qux: { foo_qux: { bar_baz: ['foo_bar_baz_qux'] } },
          },
        })
      ).toEqual({
        fooBar: { bazQux: { fooQux: { barBaz: ['foo_bar_baz_qux'] } } },
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with nested objects with api dates as properties`, () => {
    it('SHOULD return an object with camelCase properties, but api dates are unchanged', () => {
      expect(
        testedModule.camelCasifyProperties({
          foo_bar: {
            baz_qux: { foo_qux: { '2020-07-22': ['foo_bar_baz_qux'] } },
          },
        })
      ).toEqual({
        fooBar: { bazQux: { fooQux: { '2020-07-22': ['foo_bar_baz_qux'] } } },
      })
    })
  })

  describe(`camelCasifyProperties():
  GIVEN an object with deeply nested objects and arrays with snake_case properties`, () => {
    it('SHOULD return a deeply nested object with camelCase properties', () => {
      const deeplyNestedObject = {
        list: [
          {
            foo_bar: {
              baz_qux: [
                {
                  name: 'foo',
                  height: 1234,
                  gender: undefined,
                  skills: ['knitting', 'iceskating', 'cooking'],
                  can_bark: false,
                },
              ],
            },
          },
          {
            foo_bar: {
              baz_qux: [
                {
                  name: 'bar',
                  height: 4567,
                  gender: 'male',
                  skills: null,
                  can_bark: true,
                },
              ],
            },
          },
        ],
        count: 5,
      }
      const expectedObject = {
        list: [
          {
            fooBar: {
              bazQux: [
                {
                  name: 'foo',
                  height: 1234,
                  gender: undefined,
                  skills: ['knitting', 'iceskating', 'cooking'],
                  canBark: false,
                },
              ],
            },
          },
          {
            fooBar: {
              bazQux: [
                {
                  name: 'bar',
                  height: 4567,
                  gender: 'male',
                  skills: null,
                  canBark: true,
                },
              ],
            },
          },
        ],
        count: 5,
      }
      expect(testedModule.camelCasifyProperties(deeplyNestedObject)).toEqual(expectedObject)
    })
  })

  describe(`snakeCasifyProperties():
  GIVEN an object with camelCase properties`, () => {
    it('SHOULD return an object with snake_case properties', () => {
      expect(testedModule.snakeCasifyProperties({ fooBar: 'baz' })).toEqual({
        foo_bar: 'baz',
      })
    })
  })

  describe(`snakeCasifyProperties():
  GIVEN an object with nested objects with camelCase properties
  AND one object is an instance of File`, () => {
    it('SHOULD return an object with snake_case properties', () => {
      const file = new File([], 'file.txt')
      expect(
        testedModule.snakeCasifyProperties({
          fooBar: { bazQux: 'foo' },
          newFile: file,
        })
      ).toEqual({
        foo_bar: {
          baz_qux: 'foo',
        },
        new_file: file,
      })
    })
  })

  describe(`snakeCasifyProperties():
  GIVEN an object with nested objects with camelCase properties
  AND some snake_case values`, () => {
    it('SHOULD return an object with snake_case properties, but values are unchanged', () => {
      expect(
        testedModule.snakeCasifyProperties({
          fooBar: { bazQux: { fooQux: { barBaz: ['fooBarBazQux'] } } },
        })
      ).toEqual({
        foo_bar: {
          baz_qux: { foo_qux: { bar_baz: ['fooBarBazQux'] } },
        },
      })
    })
  })

  describe(`snakeCasifyProperties():
  GIVEN an object with nested objects with api dates as properties`, () => {
    it('SHOULD return an object with snake_case properties, but api dates are unchanged', () => {
      expect(
        testedModule.snakeCasifyProperties({
          fooBar: {
            bazQux: { fooQux: { '2020-07-22': ['fooBarBazQux'] } },
          },
        })
      ).toEqual({
        foo_bar: { baz_qux: { foo_qux: { '2020-07-22': ['fooBarBazQux'] } } },
      })
    })
  })

  describe(`snakeCasifyProperties():
  GIVEN an object with deeply nested objects and arrays with camelCase properties`, () => {
    it('SHOULD return a deeply nested object with snake_case properties', () => {
      const deeplyNestedObject = {
        list: [
          {
            fooBar: {
              bazQux: [
                {
                  name: 'foo',
                  height: 1234,
                  gender: undefined,
                  skills: ['knitting', 'iceskating', 'cooking'],
                  canBark: false,
                },
              ],
            },
          },
          {
            fooBar: {
              bazQux: [
                {
                  name: 'bar',
                  height: 4567,
                  gender: 'male',
                  skills: null,
                  canBark: true,
                },
              ],
            },
          },
        ],
        count: 5,
      }
      const expectedObject = {
        list: [
          {
            foo_bar: {
              baz_qux: [
                {
                  name: 'foo',
                  height: 1234,
                  gender: undefined,
                  skills: ['knitting', 'iceskating', 'cooking'],
                  can_bark: false,
                },
              ],
            },
          },
          {
            foo_bar: {
              baz_qux: [
                {
                  name: 'bar',
                  height: 4567,
                  gender: 'male',
                  skills: null,
                  can_bark: true,
                },
              ],
            },
          },
        ],
        count: 5,
      }

      expect(testedModule.snakeCasifyProperties(deeplyNestedObject)).toEqual(expectedObject)
    })
  })
})
