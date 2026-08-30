import { createContext, useContext } from 'react'

/**
 * How glass finds out what is underneath it.
 *
 * The mesh keeps a heavily downscaled copy of itself — a "probe" — and glass
 * surfaces sample that instead of the real canvas. Reading pixels from a
 * full-resolution canvas on every scroll would be far too expensive on the
 * handsets this app is for; reading one pixel from a 24×48 copy is free.
 */

export interface MeshSampler {
  /**
   * Average colour behind a rectangle in viewport coordinates.
   * Returns null when the mesh is not painted (high contrast, no ground yet).
   */
  sample: (rect: DOMRect) => { r: number; g: number; b: number } | null
}

export const MeshContext = createContext<MeshSampler | null>(null)

export const useMeshSampler = () => useContext(MeshContext)
