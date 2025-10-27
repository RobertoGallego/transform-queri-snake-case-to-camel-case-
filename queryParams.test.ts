import { INITIAL_BUYER_MARKETPLACE_FILTERS } from 'src/reducers/filters'
import { BUYER_MARKET_PAGE_REGEXP } from 'src/store/configureStore'
import { MOCK_STORE_BUYER_FILTERS } from 'src/testing/buyerFilter.mock'
import { mockHistory } from 'src/testing/routerProps.mock'
import { BuyerFilter, QualityName } from 'src/types'

import { appendQueryParams, applyQueryParamsFilters, formatQueryParams } from './queryParams'

describe('queryParams', () => {
  const BASE_URL = 'https://example.com/buyer/marketplace/123/market/live/'

  const PARAMS = [
    `category-id=${MOCK_STORE_BUYER_FILTERS.categoryId}`,
    `deliverable-dates[]=${(MOCK_STORE_BUYER_FILTERS.deliverableDates as ApiDate[])[0]}`,
    `deliverable-dates[]=${(MOCK_STORE_BUYER_FILTERS.deliverableDates as ApiDate[])[1]}`,
    `fishing-port-country[]=${(MOCK_STORE_BUYER_FILTERS.fishingPortCountry as string[])[0]}`,
    `is-favorite`,
    `is-frequent`,
    `label-id[]=${(MOCK_STORE_BUYER_FILTERS.labelId as Id[])[0]}`,
    `ordering[]=${MOCK_STORE_BUYER_FILTERS.ordering}`,
    `preparation=${MOCK_STORE_BUYER_FILTERS.preparation}`,
    `q=${MOCK_STORE_BUYER_FILTERS.q}`,
    `quality[]=${encodeURIComponent((MOCK_STORE_BUYER_FILTERS.quality as string[])[0])}`,
    'self-service',
    `seller-company-id[]=${(MOCK_STORE_BUYER_FILTERS.sellerCompanyId as Id[])[0]}`,
  ].join('&')

  const URL_WITH_PARAMS = [BASE_URL, PARAMS].join('?')

  const MOCK_URL = new URL(URL_WITH_PARAMS) as unknown as Location
  const MOCK_HISTORY_OBJECT = {
    hash: '',
    pathname: BASE_URL,
    search: PARAMS,
    state: {},
  }

  const MOCK_HISTORY = mockHistory(BASE_URL)

  const mockDeliverableDate: ApiDate = '2020-06-15'
  const mockQuality: QualityName = QualityName.EXCEPTIONAL

  const MOCK_BUYER_PARTIAL_FILTERS: BuyerFilter = {
    ...INITIAL_BUYER_MARKETPLACE_FILTERS,
    ordering: ['name'],
    deliverableDates: [mockDeliverableDate],
    quality: [mockQuality],
  }

  const PARTIAL_PARAMS = [
    `deliverable-dates[]=${mockDeliverableDate}`,
    `is-favorite`,
    `is-frequent`,
    `ordering[]=${MOCK_STORE_BUYER_FILTERS.ordering}`,
    `quality[]=${encodeURIComponent(mockQuality)}`,
    'self-service',
  ].join('&')

  const URL_WITH_PARTIAL_PARAMS = [BASE_URL, PARTIAL_PARAMS].join('?')

  const MOCK_PARTIAL_URL = new URL(URL_WITH_PARTIAL_PARAMS) as unknown as Location

  describe('applyQueryParamsFilters()', () => {
    it('should return a "filters" object containing the filters retrieved from the url queryParams', () => {
      const filters = applyQueryParamsFilters(MOCK_URL, INITIAL_BUYER_MARKETPLACE_FILTERS)
      expect(filters).toEqual(MOCK_STORE_BUYER_FILTERS)
    })

    it('it should return a "filters" object containing the filters retrieved from the url queryParams, excluding any bogus parameters', () => {
      const newMockUrl = new URL([URL_WITH_PARAMS, '&yolo=toto'].join('')) as unknown as Location

      const filters = applyQueryParamsFilters(newMockUrl, INITIAL_BUYER_MARKETPLACE_FILTERS)
      expect(filters).toEqual(MOCK_STORE_BUYER_FILTERS)
    })

    it('it should return a "filters" object containing ONLY the filters retrieved from the url queryParams, and reset the other filters', () => {
      const filters = applyQueryParamsFilters(MOCK_PARTIAL_URL, INITIAL_BUYER_MARKETPLACE_FILTERS)
      expect(filters).toEqual(MOCK_BUYER_PARTIAL_FILTERS)
    })
    it('it should NOT apply the filters in the url if the url is not the buyer marketplace', () => {
      const incorrectBaseUrl = 'https://example.com/buyer/scheduler/'

      const incorrectUrlString = [incorrectBaseUrl, PARAMS].join('?')
      const incorrectUrl = new URL(incorrectUrlString) as unknown as Location

      const filters = applyQueryParamsFilters(
        incorrectUrl,
        INITIAL_BUYER_MARKETPLACE_FILTERS,
        BUYER_MARKET_PAGE_REGEXP
      )
      expect(filters).toEqual(INITIAL_BUYER_MARKETPLACE_FILTERS)
    })
  })

  describe('appendQueryParams()', () => {
    it('should replace the current url by the new one with the right queryParams', () => {
      const spiedMockHistory = { ...MOCK_HISTORY, replace: jest.fn() }
      appendQueryParams(MOCK_STORE_BUYER_FILTERS, spiedMockHistory)
      expect(spiedMockHistory.replace).toHaveBeenCalledWith(MOCK_HISTORY_OBJECT)
    })

    it('should replace the current url by the new one with the right queryParams, while keeping the current state', () => {
      const state = { key: 'value' }
      const locationWithState = { ...MOCK_HISTORY.location, state }
      const spiedMockHistory = { ...MOCK_HISTORY, replace: jest.fn(), location: locationWithState }
      appendQueryParams(MOCK_STORE_BUYER_FILTERS, spiedMockHistory)
      const NEW_MOCK_HISTORY_OBJECT = { ...MOCK_HISTORY_OBJECT, state: { key: 'value' } }
      expect(spiedMockHistory.replace).toHaveBeenCalledWith(NEW_MOCK_HISTORY_OBJECT)
    })

    it('should replace the current url by the new one with the right NON-NULL queryParams', () => {
      const newPartialFilters = {
        ...INITIAL_BUYER_MARKETPLACE_FILTERS,
        ...MOCK_BUYER_PARTIAL_FILTERS,
      }
      const spiedMockHistory = { ...MOCK_HISTORY, replace: jest.fn() }
      appendQueryParams(newPartialFilters, spiedMockHistory)
      const NEW_MOCK_HISTORY_OBJECT = { ...MOCK_HISTORY_OBJECT, search: PARTIAL_PARAMS }

      expect(spiedMockHistory.replace).toHaveBeenCalledWith(NEW_MOCK_HISTORY_OBJECT)
    })

    it('should NOT replace the current url if the path is not /buyer/', () => {
      const spiedMockHistory = {
        ...MOCK_HISTORY,
        replace: jest.fn(),
        location: {
          pathname: 'https://example.com/scheduler/',
        },
      }
      appendQueryParams(MOCK_STORE_BUYER_FILTERS, spiedMockHistory as any)
      expect(spiedMockHistory.replace).not.toHaveBeenCalledWith(MOCK_URL.toString(), {})
    })
  })

  describe('formatQueryParams()', () => {
    it('should return an empty string, given undefined', () => {
      expect(formatQueryParams()).toBe('')
    })

    it('should return an empty string, given an empty object', () => {
      expect(formatQueryParams({})).toBe('')
    })

    it('should return a query param string, given an object with primitive values', () => {
      const queryObject: QueryObject = {
        foo: 'bar',
        baz: 1,
        qux: false,
      }

      const expectedQueryString = 'baz=1&foo=bar&qux=false'

      expect(formatQueryParams(queryObject)).toBe(expectedQueryString)
    })

    it('should omit empty string values & undefined values', () => {
      const queryObject: QueryObject = {
        foo: 'bar',
        baz: undefined,
        qux: '',
      }

      const expectedQueryString = 'foo=bar'

      expect(formatQueryParams(queryObject)).toBe(expectedQueryString)
    })

    it('should url encode null value', () => {
      const queryObject: QueryObject = {
        foo: 'bar',
        baz: null,
      }

      const expectedQueryString = 'baz&foo=bar'

      expect(formatQueryParams(queryObject)).toBe(expectedQueryString)
    })
  })
})
