import PaintComponent from "../components/PaintComponent"


const PaintPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex justify-center gap-5 items-center">
            <PaintComponent/>
        </div>
    </div>
  )
}

export default PaintPage