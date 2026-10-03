import { Link } from 'react-router-dom'
import { Activity, Crown, RotateCcw } from 'lucide-react'
import { useMotionDevStore } from '../../store'
import { ToggleGroup, ToggleGroupItem } from '../../shared/ui'
import './MotionDevPanel.css'

export const MotionDevPanel = () => {
  const override = useMotionDevStore((state) => state.override)
  const setOverride = useMotionDevStore((state) => state.setOverride)
  const premiumOverride = useMotionDevStore((state) => state.premiumOverride)
  const setPremiumOverride = useMotionDevStore((state) => state.setPremiumOverride)
  const effective = override ?? 'auto'

  return (
    <div className="motion-dev-panel">
      <div className="motion-dev-panel-head">
        <Activity size={13} />
        <span>Motion: {effective}</span>
      </div>
      <ToggleGroup
        type="single"
        value={override ?? ''}
        onValueChange={(val) => setOverride(val === 'base' || val === 'full' ? val : null)}
        className="motion-dev-panel-row"
        aria-label="Motion override"
      >
        <ToggleGroupItem value="base">base</ToggleGroupItem>
        <ToggleGroupItem value="full">full</ToggleGroupItem>
      </ToggleGroup>

      <div className="motion-dev-panel-head">
        <Crown size={13} />
        <span>Premium: {premiumOverride}</span>
      </div>
      <ToggleGroup
        type="single"
        value={premiumOverride}
        onValueChange={(val) => {
          if (val === 'real' || val === 'premium' || val === 'base') setPremiumOverride(val)
        }}
        className="motion-dev-panel-row"
        aria-label="Premium override"
      >
        <ToggleGroupItem value="real">real</ToggleGroupItem>
        <ToggleGroupItem value="premium">premium</ToggleGroupItem>
        <ToggleGroupItem value="base">base</ToggleGroupItem>
      </ToggleGroup>

      <div className="motion-dev-panel-row">
        <button type="button" onClick={() => window.location.reload()}>
          <RotateCcw size={12} /> Повтор
        </button>
        <Link to="/dev/motion">Все анимации →</Link>
      </div>
    </div>
  )
}
