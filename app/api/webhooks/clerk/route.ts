import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local")
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  const supabase = createServerClient()

  // Handle the webhook
  if (evt.type === "user.created") {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

    try {
      const { error } = await supabase.from("users").insert({
        clerk_id: id,
        email: email_addresses[0]?.email_address,
        username: username || `user_${id.slice(-8)}`,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
        avatar_url: image_url,
      })

      if (error) {
        console.error("Error creating user in Supabase:", error)
        return new Response("Error creating user", { status: 500 })
      }
    } catch (error) {
      console.error("Error processing webhook:", error)
      return new Response("Error processing webhook", { status: 500 })
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data

    try {
      const { error } = await supabase
        .from("users")
        .update({
          email: email_addresses[0]?.email_address,
          username: username || `user_${id.slice(-8)}`,
          full_name: `${first_name || ""} ${last_name || ""}`.trim(),
          avatar_url: image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", id)

      if (error) {
        console.error("Error updating user in Supabase:", error)
        return new Response("Error updating user", { status: 500 })
      }
    } catch (error) {
      console.error("Error processing webhook:", error)
      return new Response("Error processing webhook", { status: 500 })
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data

    try {
      const { error } = await supabase.from("users").delete().eq("clerk_id", id)

      if (error) {
        console.error("Error deleting user from Supabase:", error)
        return new Response("Error deleting user", { status: 500 })
      }
    } catch (error) {
      console.error("Error processing webhook:", error)
      return new Response("Error processing webhook", { status: 500 })
    }
  }

  return new Response("", { status: 200 })
}
