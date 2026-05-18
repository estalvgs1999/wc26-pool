interface FlagImgProps {
  url:       string | null | undefined
  name:      string
  className?: string
}

export function FlagImg({ url, name, className = 'w-8 h-6' }: FlagImgProps) {
  if (!url) {
    return (
      <span className={`${className} rounded-sm bg-white/10 inline-block`} />
    )
  }
  return (
    <img
      src={url}
      alt={`Bandera de ${name}`}
      className={`${className} object-cover rounded-sm`}
      loading="lazy"
      draggable={false}
    />
  )
}
