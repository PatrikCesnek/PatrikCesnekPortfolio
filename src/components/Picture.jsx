import { imgSrcSet, imgSrc, imgSize } from '../assets/manifest.js'

/**
 * The one image primitive. Real <img> with alt — the prototype's
 * <div role="img"> was a workaround for its runtime, not design intent.
 */
export default function Picture({ name, alt, sizes = '100vw', className, style, eager = false }) {
  const { width, height } = imgSize(name)

  return (
    <picture>
      <source type="image/avif" srcSet={imgSrcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={imgSrcSet(name, 'webp')} sizes={sizes} />
      <img
        src={imgSrc(name)}
        srcSet={imgSrcSet(name, 'jpg')}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  )
}
