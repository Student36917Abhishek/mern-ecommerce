const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const serverOrigin = apiUrl.replace(/\/api\/?$/, '')

export function resolveImageUrl(imagePath) {
  if (!imagePath) {
    return ''
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  if (imagePath.startsWith('/')) {
    return `${serverOrigin}${imagePath}`
  }

  return imagePath
}
