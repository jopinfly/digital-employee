import { redirect } from "next/navigation";

// /chat/new redirects to /chat/[id] after creation
// This page handles the new chat entry point
export default function ChatNewPage() {
  redirect("/chat/new");
}
