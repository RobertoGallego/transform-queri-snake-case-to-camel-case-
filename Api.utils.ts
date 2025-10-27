import { camelCase, snakeCase } from 'lodash'

import { getSessionStorageValue } from '@procsea/common/utils'

import { ERROR_FAIL_TO_RETRIEVE_CURRENT_MEMBERSHIP_FROM_SESSION_STORAGE } from 'src/constants/constants'
import { isObject } from 'src/utils/lang'

// @TODO: Move to src/utils folder
export const getCSRFToken = () => {
  const cook = document.cookie.split('; ').filter(cookie => cookie.split('=')[0] === 'csrftoken')[0]
  if (cook) return cook.split('=')[1]
  return ''
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * @deprecated
 * Use getRequestInit() instead.
 */
export const getConfig = (method: Method, data?: unknown): RequestInit => {
  const currentMembershipId = getSessionStorageValue<Id>({
    key: 'currentMembershipId',
    onError: () => {
      throw new Error(ERROR_FAIL_TO_RETRIEVE_CURRENT_MEMBERSHIP_FROM_SESSION_STORAGE)
    },
  })

  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
      ...(!!currentMembershipId && { 'Current-Membership': `${currentMembershipId}` }),
    },
    credentials: 'include',
    body: JSON.stringify(data),
  }
}

const API_DATE_REGEXP = /\d{4}-\d{2}-\d{2}/

// @TODO: Move to utils folder
export const camelCasifyProperties = (entity: unknown): any => {
  if (Array.isArray(entity)) {
    return entity.map(camelCasifyProperties)
  }

  if (isObject(entity)) {
    return Object.keys(entity).reduce(
      (acc, key) => ({
        ...acc,
        [API_DATE_REGEXP.test(key) ? key : camelCase(key)]: camelCasifyProperties(entity[key]),
      }),
      {}
    )
  }

  return entity
}

// @TODO: Move to utils folder
export const snakeCasifyProperties = (entity: unknown): any => {
  if (Array.isArray(entity)) {
    return entity.map(snakeCasifyProperties)
  }

  if (isObject(entity)) {
    return Object.keys(entity).reduce(
      (acc, key) => ({
        ...acc,
        [API_DATE_REGEXP.test(key) ? key : snakeCase(key)]: snakeCasifyProperties(entity[key]),
      }),
      {}
    )
  }

  return entity
}

// @TODO: Move to utils folder
export const formatToFormData = (payload: object) => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === null) {
      formData.append(key, '')
    } else if (typeof value === 'number') {
      formData.append(key, value.toString())
    } else if (typeof value !== 'undefined') {
      formData.append(key, value)
    }
  })

  return formData
}
