/**
 * Adds query params to existing URLs (including merging duplicates)
 * @param url - Source URL to modify
 * @param params - Key/value object of params to add
 * @example
 * // returns /guides?tag=api
 * addQueryParamsToUrl('/guides?tag=hardware', { tag:'api' })
 * @example
 * // returns https://orcascan.com/guides?tag=api
 * addQueryParamsToUrl('https://orcascan.com/guides?tag=hardware', { tag: 'api' })
 * @returns Modified URL
 */
function addQueryParamsToUrl(
  url: string,
  params: Record<string, string>,
): string {
  // If URL is relative, we'll need to add a fake base
  const fakeBase = !url.startsWith('http') ? 'http://fake-base.com' : undefined
  const modifiedUrl = new URL(url || '', fakeBase)

  // Add/update query params
  Object.keys(params).forEach((key) => {
    if (modifiedUrl.searchParams.has(key)) {
      modifiedUrl.searchParams.set(key, params[key])
    } else {
      modifiedUrl.searchParams.append(key, params[key])
    }
  })

  // Return as string (remove fake base if present)
  return modifiedUrl.toString().replace(fakeBase || '', '')
}

export default addQueryParamsToUrl
