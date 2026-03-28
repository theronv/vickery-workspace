import vdCliGuideHtml from '../tools/vd-cli-guide.html?raw'

export default function CliPanel() {
  return (
    <div className="flex flex-col h-full">
      <iframe
        srcDoc={vdCliGuideHtml}
        className="flex-1 w-full border-none"
        title="vd-cli Reference"
      />
    </div>
  )
}
