export default function ExecutePanel() {
  return (
    <div className="flex flex-col h-full">
      <iframe
        src="https://my-kanbanflow.lovable.app/"
        className="flex-1 w-full border-none"
        title="KanbanFlow"
        allow="clipboard-write"
      />
    </div>
  )
}
