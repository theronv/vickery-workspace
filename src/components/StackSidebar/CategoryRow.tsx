import type { StackCategory, StackLink } from './types'
import LinkItem from './LinkItem'

interface CategoryRowProps {
  category: StackCategory;
  links: StackLink[];
  onToggle: () => void;
}

export default function CategoryRow({ category, links, onToggle }: CategoryRowProps) {
  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        aria-label={category.collapsed ? `Expand ${category.label}` : `Collapse ${category.label}`}
        className="flex items-center w-full px-3 py-2 text-vd-text-dim hover:text-vd-text-secondary transition-colors"
      >
        <span className="text-[0.65rem] font-body font-medium tracking-[0.1em] uppercase flex-1 text-left">
          {category.label}
        </span>
        <span className="text-xs" aria-hidden="true">
          {category.collapsed ? '▸' : '▾'}
        </span>
      </button>

      {!category.collapsed && (
        <div className="ml-1">
          {links.map(link => (
            <LinkItem key={link.id} icon={link.icon} label={link.label} url={link.url} />
          ))}
        </div>
      )}
    </div>
  )
}
