import { kebabCase, mapKeys, mapValues, omitBy } from 'lodash'
import { parse, stringify } from 'query-string'
import { RouteComponentProps } from 'react-router-dom'

import { BuyerFilter, BuyerFilterState, SellerFilter } from 'src/types'

export const applyQueryParamsFilters = (
  url: Location,
  initialFilters: BuyerFilterState | SellerFilter,
  regExp?: RegExp
) => {
  const queryParams = url.search

  if ((regExp && !url.pathname.match(regExp)) || !queryParams) return initialFilters

  const queryObject = parse(queryParams, {
    arrayFormat: 'bracket',
    parseBooleans: true,
    parseNumbers: true,
  })
  const filters = mapValues(initialFilters, (value, key) =>
    typeof queryObject?.[kebabCase(key)] === 'undefined' ? value : queryObject?.[kebabCase(key)]
  )

  return filters
}

export const formatQueryParams = (filters?: QueryObject) => {
  const trimmedFilters = omitBy(filters, value => value === '')
  const formatedQueryObject = mapKeys(trimmedFilters, (_value, key) => kebabCase(key))

  return stringify(formatedQueryObject, { arrayFormat: 'bracket' })
}

export const appendQueryParams = (
  filters: BuyerFilter | SellerFilter,
  history: RouteComponentProps['history']
) => {
  const queryParams = formatQueryParams(filters as QueryObject)

  history.replace({
    hash: history.location.hash,
    pathname: history.location.pathname,
    search: queryParams,
    state: history.location.state,
  })
}
