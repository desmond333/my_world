import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>

const thresholds: { max: number; Icon: IconComponent }[] = [
  { max: 0, Icon: Sun },
  { max: 2, Icon: CloudSun },
  { max: 3, Icon: Cloud },
  { max: 48, Icon: CloudFog },
  { max: 67, Icon: CloudRain },
  { max: 77, Icon: CloudSnow },
  { max: 82, Icon: CloudRain },
  { max: 86, Icon: CloudSnow },
]

export type WeatherIconProps = {
  code: number
  size?: number | string
  strokeWidth?: number | string
  className?: string
}

export const WeatherIcon = ({ code, size, strokeWidth, className }: WeatherIconProps) => {
  const matched = thresholds.find((item) => code <= item.max)
  const Icon = matched ? matched.Icon : CloudLightning
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
