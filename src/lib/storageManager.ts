import { supabase } from '@/lib/supabase/client.ts'
import { getAssetUrl } from '@/lib/utils.ts'

export type StorageFolder = 'landing' | 'psychologists' | 'services' | 'brochures' | 'brand' | 'avatars'

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0 to 1
}

/**
 * Optimizes an image File/Blob on the client by rendering it onto an HTML Canvas
 * and converting it to modern WebP format with optional dimension limits and compression.
 */
export async function optimizeImageToWebP(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ blob: Blob; fileName: string; originalSize: number; optimizedSize: number }> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.85 } = options

  return new Promise((resolve, reject) => {
    // If it's already an SVG or non-raster, keep it as is
    if (file.type === 'image/svg+xml') {
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      resolve({
        blob: file,
        fileName: `${baseName}.svg`,
        originalSize: file.size,
        optimizedSize: file.size,
      })
      return
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    reader.onerror = (err) => reject(new Error('Gagal membaca berkas gambar: ' + err))

    img.onload = () => {
      let { width, height } = img

      // Scale down proportionally if larger than maximum limits
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Browser tidak mendukung Canvas 2D'))
        return
      }

      // Smooth scaling interpolation
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Gagal mengonversi gambar ke WebP'))
            return
          }

          const baseName = file.name
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')

          resolve({
            blob,
            fileName: `${baseName}.webp`,
            originalSize: file.size,
            optimizedSize: blob.size,
          })
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => reject(new Error('Gagal memproses gambar'))
    reader.readAsDataURL(file)
  })
}

/**
 * Extracts a playable YouTube embed URL from various YouTube link formats
 * (e.g. watch?v=, youtu.be/, shorts/, embed/)
 */
export function parseYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()

  // 1. Check if already embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed
  }

  // 2. youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`
  }

  // 3. youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`
  }

  // 4. youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`
  }

  return null
}

/**
 * Checks whether a given URL is a YouTube video link
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.includes('youtube.com') || lower.includes('youtu.be')
}

/**
 * Lists all video files available in the Supabase public-assets bucket.
 */
export async function listStorageVideos(bucket = 'public-assets'): Promise<{ name: string; url: string; size: number }[]> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error || !data) return []

    const videoExts = ['.mp4', '.webm', '.ogg', '.mov']
    const videos: { name: string; url: string; size: number }[] = []

    for (const file of data) {
      if (file.name && videoExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        videos.push({
          name: file.name,
          url: getAssetUrl(file.name),
          size: file.metadata?.size || 0,
        })
      }
    }

    // Also check 'landing' folder if any
    const { data: landingData } = await supabase.storage.from(bucket).list('landing', {
      limit: 50,
    })
    if (landingData) {
      for (const file of landingData) {
        if (file.name && videoExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
          videos.push({
            name: `landing/${file.name}`,
            url: getAssetUrl(`landing/${file.name}`),
            size: file.metadata?.size || 0,
          })
        }
      }
    }

    return videos
  } catch (err) {
    console.error('Gagal mengambil daftar video dari storage:', err)
    return []
  }
}

/**
 * Uploads a video file directly to the Supabase storage bucket (e.g. landing/ or root).
 */
export async function uploadManagedVideo({
  file,
  folder = 'landing',
  customName,
  previousUrl,
  bucket = 'public-assets',
}: {
  file: File
  folder?: StorageFolder
  customName?: string
  previousUrl?: string | null
  bucket?: string
}): Promise<{ url: string; path: string; sizeKb: number }> {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const baseName = customName
    ? customName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    : file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-')

  const storagePath = `${folder}/${baseName}-${timestamp}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      contentType: file.type || 'video/mp4',
      upsert: true,
    })

  if (uploadError) {
    throw new Error('Gagal mengunggah video ke storage: ' + uploadError.message)
  }

  // Delete previous video if stored in bucket
  if (previousUrl) {
    const oldPath = extractStoragePath(previousUrl, bucket)
    if (oldPath && oldPath !== storagePath) {
      try {
        await supabase.storage.from(bucket).remove([oldPath])
      } catch (err) {
        console.warn('Gagal menghapus video lama di storage:', err)
      }
    }
  }

  return {
    url: getAssetUrl(storagePath),
    path: storagePath,
    sizeKb: Math.round(file.size / 1024),
  }
}

/**
 * Extracts the storage relative path from a full public Supabase CDN URL.
 * Example: https://.../storage/v1/object/public/public-assets/landing/hero.webp -> landing/hero.webp
 */
export function extractStoragePath(url: string, bucket = 'public-assets'): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  if (url.includes(marker)) {
    const parts = url.split(marker)
    if (parts[1]) {
      return decodeURIComponent(parts[1])
    }
  }
  return null
}

/**
 * Uploads an optimized asset into a well-organized folder in Supabase Storage.
 * If previousUrl is supplied and exists in the bucket, it will delete the old file automatically.
 */
export async function uploadManagedAsset({
  file,
  folder,
  customName,
  previousUrl,
  bucket = 'public-assets',
}: {
  file: File
  folder: StorageFolder
  customName?: string
  previousUrl?: string | null
  bucket?: string
}): Promise<{ url: string; path: string; sizeSavedKb: number }> {
  // 1. Optimize client-side to WebP
  const optimized = await optimizeImageToWebP(file)
  const timestamp = Date.now()
  const cleanName = customName
    ? `${customName.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${timestamp}.webp`
    : `${optimized.fileName.replace('.webp', '')}-${timestamp}.webp`

  const storagePath = `${folder}/${cleanName}`

  // 2. Upload new asset to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, optimized.blob, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    throw new Error('Gagal mengunggah gambar ke storage: ' + uploadError.message)
  }

  // 3. Delete previous asset if it was located in the bucket to prevent orphan files
  if (previousUrl) {
    const oldPath = extractStoragePath(previousUrl, bucket)
    if (oldPath && oldPath !== storagePath) {
      try {
        await supabase.storage.from(bucket).remove([oldPath])
      } catch (err) {
        console.warn('Gagal menghapus file lama di storage:', err)
      }
    }
  }

  const publicUrl = getAssetUrl(storagePath)
  const sizeSavedKb = Math.round((optimized.originalSize - optimized.optimizedSize) / 1024)

  return {
    url: publicUrl,
    path: storagePath,
    sizeSavedKb,
  }
}

/**
 * Deletes an asset directly from the Supabase bucket.
 */
export async function deleteManagedAsset(url: string, bucket = 'public-assets'): Promise<boolean> {
  const path = extractStoragePath(url, bucket)
  if (!path) return false

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    console.error('Gagal menghapus asset dari storage:', error.message)
    return false
  }
  return true
}
