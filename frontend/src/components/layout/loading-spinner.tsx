import { Loader2 } from "lucide-react"

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
}

export default LoadingSpinner