import angelTeamHtml from '../tools/angel-team-prompts.html?raw'

export default function AngelTeamPanel() {
  return (
    <div className="flex flex-col h-full">
      <iframe
        srcDoc={angelTeamHtml}
        className="flex-1 w-full border-none"
        title="Angel Team Prompts"
      />
    </div>
  )
}
