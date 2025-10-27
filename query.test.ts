import {
  getQueryFromUrl,
  snakeCaseKeepFirstDash,
  transformObjectToQuery,
  transformQueryToObject,
} from './query'

describe(`snakeCaseKeepFirstDash():
GIVEN a camelCase string prepended with a "-"`, () => {
  it('SHOULD return a snake_case string prepended with a "-"', () => {
    expect(snakeCaseKeepFirstDash('-camelCaseString')).toBe('-camel_case_string')
  })
})

describe(`snakeCaseKeepFirstDash():
GIVEN a camelCase string NOT prepended with a "-"`, () => {
  it('SHOULD return a snake_case string', () => {
    expect(snakeCaseKeepFirstDash('camelCaseString')).toBe('camel_case_string')
  })
})

describe('Query', () => {
  const state = {
    categories: ['4', '2'],
    labels: ['1', '3'],
    oppotunity: false,
    ordering: '-sellerCompany',
    preparation: true,
    qualities: ['A+', 'E+'],
    search: 'Trui',
  }

  const expectedQuery = `?${[
    'categories=4%2C2',
    'labels=1%2C3',
    'oppotunity=false',
    'ordering=-seller_company',
    'preparation=true',
    'qualities=A%2B%2CE%2B',
    'search=Trui',
  ].join('&')}`

  it('should correctly transform a state object into a URL query', () => {
    expect(transformObjectToQuery(state)).toEqual(expectedQuery)
  })

  it('GIVEN an empty object, SHOULD return an empty string', () => {
    expect(transformObjectToQuery({})).toBe('')
  })
  it('GIVEN undefined, SHOULD return an empty string', () => {
    expect(transformObjectToQuery()).toBe('')
  })
  it('GIVEN null, SHOULD return an empty string', () => {
    expect(transformObjectToQuery(null)).toBe('')
  })
  it('transformQueryToObject should return an empty object given empty query', () => {
    expect(transformQueryToObject('')).toEqual({})
    expect(transformQueryToObject(null)).toEqual({})
    expect(transformQueryToObject()).toEqual({})
  })
  it('transformQueryToObject should convert a query to an object', () => {
    const query = '?calibre_id=117&quality=E&quantity=1&unit_id=5'
    expect(transformQueryToObject(query)).toEqual({
      calibreId: 117,
      quality: 'E',
      quantity: 1,
      unitId: 5,
    })
  })
  it('stransformQueryToObject should convert a complex query to an object', () => {
    expect(transformObjectToQuery(state)).toEqual(expectedQuery)
  })
})

describe('getQueryFromUrl()', () => {
  it('should return an empty string given an url without query params', () => {
    expect(getQueryFromUrl('https://example.com/')).toBe('')
  })

  it('should return the query string given an url with query params', () => {
    const queryString = 'foo=bar'
    expect(getQueryFromUrl(`https://example.com/?${queryString}`)).toBe(queryString)
  })
})
