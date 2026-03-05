import ApiService from '@/apis/api'

export type UnitItem = {
  id: number
  unit_no: string
  description?: string | null
  rate?: number | null
  photo_urls?: string[]
  electric_meter_no?: string | null
  water_meter_no?: string | null
}

export type UnitPayload = {
  unit_no: string
  description?: string | null
  rate?: number | null
  photos?: File[]
  electric_meter_no?: string | null
  water_meter_no?: string | null
}

export const UnitsService = {
  getAll() {
    return ApiService.get('/units')
  },
  create(payload: UnitPayload) {
    const formData = new FormData()
    formData.append('unit_no', payload.unit_no)
    if (payload.description !== undefined && payload.description !== null) {
      formData.append('description', payload.description)
    }
    if (payload.rate !== undefined && payload.rate !== null) {
      formData.append('rate', String(payload.rate))
    }
    if (payload.electric_meter_no !== undefined && payload.electric_meter_no !== null) {
      formData.append('electric_meter_no', payload.electric_meter_no)
    }
    if (payload.water_meter_no !== undefined && payload.water_meter_no !== null) {
      formData.append('water_meter_no', payload.water_meter_no)
    }
    for (const photo of payload.photos || []) {
      formData.append('photos', photo)
    }

    return ApiService.post('/unit', formData)
  },
  addPhotos(unitId: number, photos: File[]) {
    const formData = new FormData()
    for (const photo of photos) {
      formData.append('photos', photo)
    }
    return ApiService.post(`/unit/${unitId}/photos`, formData)
  },
  removePhoto(unitId: number, photoUrl: string) {
    return ApiService.delete(`/unit/${unitId}/photos`, { photo_url: photoUrl })
  },
}
