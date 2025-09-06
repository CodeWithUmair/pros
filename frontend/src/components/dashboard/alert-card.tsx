import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User } from "@/types/user.types";

export default function AlertCard({ user }: { user: User }) {

    return (
        <Alert className="rounded-3xl p-4 md:p-6 xl:p-8 flex items-center sm:flex-row flex-col-reverse gap-4 sm:gap-0 justify-between relative">
            <div className="flex flex-col gap-3">
                <AlertTitle className="text-2xl">
                    Welcome to StablePal, <strong>{user.name}</strong>
                </AlertTitle>
                <AlertDescription className="text-base">
                    Your dashboard is ready—send, receive, and manage your digital
                    assets effortlessly.
                </AlertDescription>
            </div>
            <span className="text-4xl xl:text-5xl mr-5">👋🏼</span>
        </Alert>
    );
}
