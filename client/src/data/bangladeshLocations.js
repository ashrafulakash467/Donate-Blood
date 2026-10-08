import districtData from 'bangladesh-geojson/districts'
import upazilaData from 'bangladesh-geojson/upazilas'

export const districts = Object.freeze(
  [...districtData.districts].sort((first, second) => first.name.localeCompare(second.name)),
)

export function getDistrictByName(name) {
  return districts.find((district) => district.name === name)
}

export function getUpazilasByDistrictName(districtName) {
  const district = getDistrictByName(districtName)
  if (!district) return []

  return upazilaData.upazilas.filter((upazila) => upazila.district_id === district.id).sort((first, second) =>
    first.name.localeCompare(second.name),
  )
}
