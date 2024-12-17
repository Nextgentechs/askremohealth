export default function LinearProgressBar() {
  return (
    <div className="mx-auto flex min-h-screen w-screen max-w-md flex-row items-center justify-center">
      <div className="relative h-1 w-full overflow-hidden bg-gray-300">
        <div className="bg-primary animate-streaming-progress absolute left-0 top-0 h-full w-1/2"></div>
      </div>
    </div>
  )
}
