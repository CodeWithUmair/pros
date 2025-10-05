import { redirect } from "next/navigation";

export default function Page() {
  redirect('/feed')
  return (
    <div className="min-h-screen">
    </div>
  );
}
