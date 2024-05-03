type Props = {
  currentPosition: string
  prevPosition: string
}

const Position = (props: Props) => {
  const { currentPosition, prevPosition } = props
  return (
    <div className="w-45 aspect-1 relative items-center justify-center self-center rounded-full bg-black">
      <div className="absolute items-center justify-center">
        <p className="font-primary-medium text-18 text-center text-white">
          {currentPosition ?? ''}
        </p>
      </div>

      <div className="absolute items-center justify-center">
        <p className="font-primary-medium text-18 text-center text-white">
          {prevPosition ?? ''}
        </p>
      </div>
    </div>
  )
}

export default Position
