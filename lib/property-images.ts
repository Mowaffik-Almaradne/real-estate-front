/**
 * Fake property photos from the public internet (Unsplash + Picsum).
 * Used on public listings when the backend has no/blank media.
 * Deterministic per property id so cards stay stable across reloads.
 */

type PropertyImageInput = {
  id: number
  property_type?: string | null
  main_image?: string | null
  main_image_thumb?: string | null
}

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Unique stock photo per id (lots of variety for long browse lists). */
const picsum = (id: number, w = 1200, h = 800) =>
  `https://picsum.photos/seed/re-prop-${Math.abs(Number(id) || 0)}/${w}/${h}`

const BY_TYPE: Record<string, string[]> = {
  apartment: [
    u("photo-1502672260266-1c1ef2d93688"),
    u("photo-1522708323590-d24dbb6b0267"),
    u("photo-1493809842364-78817add7ffb"),
    u("photo-1560448204-e02f11c3d0e2"),
    u("photo-1505693416388-ac5ce068fe85"),
    u("photo-1560185127-6ed189bf02f4"),
    u("photo-1560448204-603b3fc33ddc"),
    u("photo-1484154218962-a197022b5858"),
    u("photo-1493666438817-866a91353ca9"),
    u("photo-1554995207-c18c203602cb"),
    u("photo-1560184897-ae75f418493e"),
    u("photo-1502672023488-70e2349df1c6"),
  ],
  villa: [
    u("photo-1613490493576-7fde63acd811"),
    u("photo-1600596542815-ffad4c1539a9"),
    u("photo-1600585154340-be6161a56a0c"),
    u("photo-1600607687939-ce8a6c25118c"),
    u("photo-1512917774080-9991f1c4c750"),
    u("photo-1600607687644-c7171b42498f"),
    u("photo-1600585154526-990dced4db0d"),
    u("photo-1600047509807-ba8f99d2cdde"),
    u("photo-1600566753086-00f18fb6b3ea"),
    u("photo-1613977257363-707ba9348227"),
    u("photo-1600210492486-724fe5c67fb0"),
    u("photo-1600566753376-12cfd465feee"),
  ],
  house: [
    u("photo-1564013799919-ab600027ffc6"),
    u("photo-1570129477492-45c003edd2be"),
    u("photo-1605276374104-dee2a0ed3cd6"),
    u("photo-1600047509807-ba8f99d2cdde"),
    u("photo-1600566753190-17f0baa2a6c3"),
    u("photo-1568605114967-8130f3a36994"),
    u("photo-1576941089067-2de3c901e126"),
    u("photo-1583608205776-bfd35f0d9f83"),
    u("photo-1598228723791-2175ad4040f8"),
    u("photo-1605146769289-440113cc3d00"),
    u("photo-1600047509358-9dc75507daeb"),
    u("photo-1600573472591-ee6980ba1e81"),
  ],
  land: [
    u("photo-1500382017468-9049fed747ef"),
    u("photo-1464822759023-fed622ff2c3b"),
    u("photo-1470071459604-3b5ec3a7fe05"),
    u("photo-1500530855697-b586d89ba3ee"),
    u("photo-1441974231531-c6227db76b6e"),
    u("photo-1472214103451-9374bd1c798e"),
    u("photo-1469474968028-56623f02e42e"),
    u("photo-1500534314209-a25ddb2bd429"),
  ],
  commercial: [
    u("photo-1486406146926-c627a92ad1ab"),
    u("photo-1497366216548-37526070297c"),
    u("photo-1497366811353-6870744d04b2"),
    u("photo-1554469384-e58fac16e23a"),
    u("photo-1577412647305-991150c7d163"),
    u("photo-1497366754035-f200968a6e72"),
    u("photo-1454165804606-c3d57bc86b40"),
    u("photo-1486406146926-c627a92ad1ab"),
  ],
  office: [
    u("photo-1497366754035-f200968a6e72"),
    u("photo-1524758631624-e2822e304c36"),
    u("photo-1497215842964-222b430dc094"),
    u("photo-1497366216548-37526070297c"),
    u("photo-1556761175-5973dc0f32e7"),
    u("photo-1497366811353-6870744d04b2"),
    u("photo-1517502884422-41eaead166d4"),
    u("photo-1462826303086-3297911100dd"),
  ],
  warehouse: [
    u("photo-1586528116311-ad8dd3c8310d"),
    u("photo-1553413077-190dd305871c"),
    u("photo-1565610222536-ef125c59da2e"),
    u("photo-1586528116493-a029325540fa"),
    u("photo-1581094794329-c8112a89af12"),
    u("photo-1504328343528-c1c0a0c34329"),
  ],
  other: [
    u("photo-1600585154526-990dced4db0d"),
    u("photo-1600047509807-ba8f99d2cdde"),
    u("photo-1600566753086-00f18fb6b3ea"),
    u("photo-1560448204-e02f11c3d0e2"),
    u("photo-1564013799919-ab600027ffc6"),
    u("photo-1512917774080-9991f1c4c750"),
  ],
}

const DEFAULT_POOL = [
  ...BY_TYPE.villa,
  ...BY_TYPE.apartment,
  ...BY_TYPE.house,
  ...BY_TYPE.commercial,
]

function poolForType(propertyType?: string | null): string[] {
  if (!propertyType) return DEFAULT_POOL
  return BY_TYPE[propertyType] ?? DEFAULT_POOL
}

export function getPropertyFallbackImage(
  id: number,
  propertyType?: string | null,
  width = 1200
): string {
  const n = Math.abs(Number(id) || 0)
  // Every 2nd listing uses Picsum so long API lists stay visually distinct.
  if (n % 2 === 0) {
    return picsum(n, width, Math.round(width * 0.66))
  }
  const pool = poolForType(propertyType)
  const index = n % pool.length
  const url = pool[index] ?? DEFAULT_POOL[0]
  if (width === 1200) return url
  return url.replace(/w=\d+/, `w=${width}`)
}

/** Treat blank strings as missing media. */
function hasImageUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export type ResolvePropertyImageOptions = {
  preferThumb?: boolean
  width?: number
  /** Always use internet fake images (public browse). */
  forceFallback?: boolean
}

export function resolvePropertyImage(
  property: PropertyImageInput,
  options: ResolvePropertyImageOptions = {}
): string {
  const { preferThumb = true, width = 1200, forceFallback = false } = options
  if (forceFallback) {
    return getPropertyFallbackImage(property.id, property.property_type, width)
  }
  if (preferThumb && hasImageUrl(property.main_image_thumb)) return property.main_image_thumb
  if (hasImageUrl(property.main_image)) return property.main_image
  if (!preferThumb && hasImageUrl(property.main_image_thumb)) return property.main_image_thumb
  return getPropertyFallbackImage(property.id, property.property_type, width)
}

/** Fill missing main_image / thumb with a stable, type-aware fallback. */
export function withPropertyImages<T extends PropertyImageInput>(
  property: T,
  options: { forceFallback?: boolean } = {}
): T {
  if (!options.forceFallback && (hasImageUrl(property.main_image) || hasImageUrl(property.main_image_thumb))) {
    return {
      ...property,
      main_image: hasImageUrl(property.main_image)
        ? property.main_image
        : property.main_image_thumb,
      main_image_thumb: hasImageUrl(property.main_image_thumb)
        ? property.main_image_thumb
        : property.main_image,
    }
  }
  const fallback = getPropertyFallbackImage(property.id, property.property_type)
  const thumb = getPropertyFallbackImage(property.id, property.property_type, 640)
  return {
    ...property,
    main_image: fallback,
    main_image_thumb: thumb,
  }
}

export function withPropertyImagesList<T extends PropertyImageInput>(
  properties: T[] | null | undefined,
  options: { forceFallback?: boolean } = {}
): T[] {
  if (!properties?.length) return []
  return properties.map((p) => withPropertyImages(p, options))
}

type LovedProperty = PropertyImageInput & {
  is_favorited?: boolean
  is_loved?: boolean
  favorites_count?: number
}

/** Normalize OpenAPI `is_loved` → frontend `is_favorited` and attach image fallbacks. */
export function normalizeProperty<T extends LovedProperty>(
  property: T,
  options: { forceFallback?: boolean } = {}
): T {
  const withImages = withPropertyImages(property, options)
  const favorited =
    typeof withImages.is_favorited === "boolean"
      ? withImages.is_favorited
      : Boolean(withImages.is_loved)
  return {
    ...withImages,
    is_favorited: favorited,
  }
}

export function normalizePropertyList<T extends LovedProperty>(
  properties: T[] | null | undefined,
  options: { forceFallback?: boolean } = {}
): T[] {
  if (!properties?.length) return []
  return properties.map((p) => normalizeProperty(p, options))
}
