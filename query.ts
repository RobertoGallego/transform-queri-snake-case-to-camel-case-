import { camelCase, keys, snakeCase } from 'lodash'
import { parse } from 'query-string'

import { camelCasifyProperties } from '../../services/Api.utils'

const isString = (value: QueryParamValue): value is string => typeof value === 'string'
const isNumber = (value: QueryParamValue): value is number => typeof value === 'number'
const isArray = (value: QueryParamValue): value is Array<any> => Array.isArray(value)

const keepFirstDash = (method: Function) => (value: string) =>
  value.substring(0, 1) === '-' ? `-${method(value)}` : method(value)

export const snakeCaseKeepFirstDash = (value: string) => keepFirstDash(snakeCase)(value)

const formatKeyValuePair = ({ object, key }: { object: QueryObject; key: string }) => {
  const prefix = snakeCase(key)
  const keyValue = object[key]
  if (keyValue === undefined || keyValue === null) {
    return ''
  }
  // expeption for ordering: values need to be snakeCasified too.
  if (key === 'ordering') {
    if (isString(keyValue)) {
      return `${prefix}=${encodeURIComponent(
        keyValue
          .split(',')
          .map(value => snakeCaseKeepFirstDash(value))
          .join(',')
      )}`
    }
    if (isArray(keyValue)) {
      return `${prefix}=${encodeURIComponent(
        keyValue
          .map((value: string | number) =>
            isNumber(value) ? value : snakeCaseKeepFirstDash(value)
          )
          .join(',')
      )}`
    }
  }
  return `${prefix}=${encodeURIComponent(isArray(keyValue) ? keyValue.join(',') : keyValue)}`
}

const isQueryable = (value: QueryParamValue) =>
  value !== null && value !== undefined && value !== ''

/* transform a filters object of {<key>: Array<value> | String} into a REST API query */
export const transformObjectToQuery = (object?: QueryObject | null) => {
  if (!object) {
    return ''
  }
  return keys(object)
    .filter(key => isQueryable(object[key]))
    .map(key => formatKeyValuePair({ object, key }))
    .reduce((acc, keyValuePair) => `${acc ? `${acc}&` : '?'}${keyValuePair}`, '')
}

// Smelly function for a smelly design.
const handleOrderingException = (object: { [key: string]: string | number | boolean }) => {
  const targetedValue = object.ordering
  if (targetedValue) {
    return {
      ...object,
      ordering: isString(targetedValue)
        ? targetedValue
            .split(',')
            .map(value => keepFirstDash(camelCase)(value))
            .join(',')
        : targetedValue,
    }
  }
  return object
}

export const transformQueryToObject = (query?: string | null) => {
  if (!query) {
    return {}
  }
  return handleOrderingException(
    camelCasifyProperties(
      parse(query, { arrayFormat: 'comma', parseBooleans: true, parseNumbers: true })
    )
  )
}

export const getQueryFromUrl = (url: string) => url.split('?')[1] || ''

export const getLocaleFromPathname = (pathname: string) => pathname.substring(0, 3)
