export default function FolderSort({ game }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{game?.instructions || 'Sort files into the right folders.'}</p>
      <p className="text-sm">Folder sort simulation.</p>
    </div>
  )
}
