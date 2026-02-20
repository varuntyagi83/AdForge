import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to categories page as the default landing page
  redirect('/categories')
}
