import autocompleter from "autocompleter"
import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { useAllEmails } from "@/hooks/useEmailSuggestions"

export function EmailAutocompleteInput({ value, onChange, onSelect }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { emails } = useAllEmails()
    const acInstance = useRef<any>(null)

    useEffect(() => {
        if (!inputRef.current) return

        acInstance.current = autocompleter({
            input: inputRef.current,
            minLength: 1,
            fetch(text, update) {
                const filtered = emails.filter(email =>
                    email.toLowerCase().includes(text.toLowerCase())
                )
                update(filtered.map(email => ({ label: email })))
            },
            onSelect(item) {
                onSelect(item.label)
            },
            render(item) {
                const div = document.createElement("div")
                div.textContent = item.label
                div.className = "px-3 py-2 cursor-pointer text-foreground hover:bg-accent hover:text-accent-foreground"
                return div
            }
        })

        // Optional: Handle keyboard events for arrow keys and Enter
        function handleKeyDown(e: KeyboardEvent) {
            if (!acInstance.current) return

            // Prevent default behavior for arrow keys and enter to avoid cursor jumps or form submits
            if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                e.preventDefault()
                // Trigger the event on autocompleter's internal input handler
                // The autocompleter listens to input's keydown, so we just let it handle normally
                // No manual forwarding needed here unless bugs arise
            }
        }

        inputRef.current.addEventListener("keydown", handleKeyDown)

        return () => {
            acInstance.current?.destroy()
            inputRef.current?.removeEventListener("keydown", handleKeyDown)
        }
    }, [emails, onSelect])

    // Dispatch input event to refresh dropdown on each value change
    useEffect(() => {
        if (inputRef.current) {
            const event = new Event("input", { bubbles: true })
            inputRef.current.dispatchEvent(event)
        }
    }, [value])

    return (
        <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search and select email..."
            autoComplete="off"
            spellCheck={false}
        />
    )
}
