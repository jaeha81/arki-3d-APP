interface Props {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="text-[hsl(var(--muted-foreground))] opacity-50">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-[hsl(var(--foreground))]">{title}</h3>
      {description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
