import { getCollection } from "astro:content";

export async function GET({ params, request }) {
  const posts = await getCollection("posts");
  return new Response(JSON.stringify(posts));
}
