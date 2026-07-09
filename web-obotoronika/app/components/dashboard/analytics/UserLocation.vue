<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface FeatureProperties {
  NAME_4?: string
  DIVISION?: string
  name?: string
}

interface GeoJSONFeature {
  properties: FeatureProperties

  [key: string]: any
}

interface UserDataMap {
  [key: string]: number
}

const store = useAnalyticsStore()
const userData: UserDataMap = { ...store.visitor.data }

// Normalize region names for consistent matching
const normalize = (str: string): string =>
  str.toLowerCase().replace(/ upazila| division| district| zila| city/g, '').trim()

// Define color scale (light to dark)
const colorScale = [
  '#028ca666',
  '#028ca699',
  '#028ca6cc',
  '#028ca6',
]
const zeroColor = '#ffffff0d'

// Calculate max count dynamically
const maxCount = Math.max(1, ...Object.values(userData))

// Get dynamic fill color based on count and scale
const getColor = (count: number): string | undefined => {
  if (count === 0) return zeroColor

  const numberOfBuckets = colorScale.length
  const bucketSize = Math.max(1, Math.ceil(maxCount / numberOfBuckets))
  const index = Math.min(Math.floor((count - 1) / bucketSize), numberOfBuckets - 1)
  return colorScale[index]
}

// Style function for each feature
const style = (feature: GeoJSONFeature) => {
  const rawName
    = feature.properties.NAME_4
      || feature.properties.DIVISION
      || feature.properties.name
      || ''

  const normalizedName = normalize(rawName)
  const matchedKey = Object.keys(userData || {}).find(
    key => normalize(key) === normalizedName,
  )
  const count = matchedKey ? userData[matchedKey] : 0

  return {

    // @ts-ignore
    fillColor: getColor(count),
    weight: 0,
    opacity: 1,
    color: '#fc6a031a',
    dashArray: '-',
    fillOpacity: 1,
    transition: 'all 0.3s ease',
  }
}

let map: any = null

let geojson: any = null

let L: any = null

onMounted(async () => {
  if (!import.meta.client) return

  // @ts-ignore
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map('map').setView([23.7, 90.4], 7)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  }).addTo(map)

  try {
    const response = await fetch('/geo/bangladesh.geojson')
    const data = await response.json()

    geojson = L.geoJSON(data, { style }).addTo(map)

    geojson.eachLayer((layer: any) => {
      const feature: GeoJSONFeature = layer.feature
      if (!feature) return

      const rawName
        = feature.properties.NAME_4
          || feature.properties.DIVISION
          || feature.properties.name
          || ''

      const normalizedName = normalize(rawName)
      const matchedKey = Object.keys(userData || {}).find(
        key => normalize(key) === normalizedName,
      )
      const count = matchedKey ? userData[matchedKey] : 0

      layer.bindTooltip(`<strong>${rawName}</strong><br>Users: ${count}`, {
        sticky: true,
        direction: 'auto',
        opacity: 0.9,
      })

      layer.on({

        mouseover: (e: any) => {
          const target = e.target
          target.setStyle({
            weight: 3,
            color: '#333',
            fillOpacity: 1,
          })
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            target.bringToFront()
          }
          target.openTooltip()
        },

        mouseout: (e: any) => {
          geojson.resetStyle(e.target)
          e.target.closeTooltip()
        },
      })
    })
  }
  catch (error) {
    console.warn('Error loading GeoJSON:', error)
  }
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <AtomsWidgetCard
    class="h-[464px] @sm:h-[520px] @7xl:col-span-4 @7xl:col-start-9 @7xl:row-start-1 @7xl:row-end-3 @7xl:h-full flex flex-col justify-between"
    title="User Location"
    title-class-name="text-gray-500 font-normal font-inter !text-sm"
  >
    <client-only>
      <div id="map" class="h-full w-full rounded-lg shadow-md" />
    </client-only>
  </AtomsWidgetCard>
</template>

<style scoped>
#map {
  height: 100%;
  width: 100%;
  user-select: none;
}

:deep(.leaflet-tooltip) {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-weight: 600;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  pointer-events: none;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
}
</style>
