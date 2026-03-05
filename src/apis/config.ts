const rawApiUrl = String(import.meta.env.VITE_API_BASE_URL || '/api').trim()

function normalizeApiBaseUrl(value: string) {
	const trimmed = value.replace(/\/$/, '')

	if (!/^https?:\/\//i.test(trimmed)) {
		return trimmed || '/api'
	}

	try {
		const url = new URL(trimmed)
		const currentPath = url.pathname.replace(/\/$/, '')

		if (!currentPath || currentPath === '') {
			url.pathname = '/api'
			return url.toString().replace(/\/$/, '')
		}

		return url.toString().replace(/\/$/, '')
	} catch {
		return trimmed
	}
}

export const API_URL = normalizeApiBaseUrl(rawApiUrl)
