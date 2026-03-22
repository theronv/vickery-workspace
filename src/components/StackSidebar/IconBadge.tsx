interface IconBadgeProps {
  icon?: string;
  label: string;
  size?: 'sm' | 'md';
}

export default function IconBadge({ icon, label, size = 'md' }: IconBadgeProps) {
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
  return (
    <span
      className={`${dim} flex items-center justify-center rounded-md bg-vd-surface text-vd-text-secondary shrink-0 select-none`}
      aria-hidden="true"
    >
      {icon || label.charAt(0).toUpperCase()}
    </span>
  )
}
