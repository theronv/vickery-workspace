import IconBadge from './IconBadge'

interface LinkItemProps {
  icon?: string;
  label: string;
  url: string;
}

export default function LinkItem({ icon, label, url }: LinkItemProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} — opens in new tab`}
      className="group flex items-center gap-2.5 px-3 py-1.5 rounded-md text-vd-text-secondary hover:bg-vd-surface hover:text-vd-text-primary transition-colors"
    >
      <IconBadge icon={icon} label={label} size="sm" />
      <span className="flex-1 truncate text-sm font-body">{label}</span>
      <span className="opacity-0 group-hover:opacity-100 text-xs text-vd-text-dim transition-opacity" aria-hidden="true">
        ↗
      </span>
    </a>
  )
}
