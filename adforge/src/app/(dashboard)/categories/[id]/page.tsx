'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ProductList } from '@/components/products/ProductList'
import { AngledShotsList } from '@/components/angled-shots/AngledShotsList'

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  look_and_feel: string | null
  counts: {
    products: number
    angled_shots: number
    backgrounds: number
    composites: number
    copy_docs: number
    guidelines: number
    final_assets: number
  }
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${resolvedParams.id}`)
        const data = await response.json()

        if (response.ok) {
          setCategory(data.category)
        } else {
          toast.error(data.error || 'Failed to load category')
          router.push('/categories')
        }
      } catch (error) {
        toast.error('Failed to load category')
        router.push('/categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [resolvedParams.id, router])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-6" />
          <div className="h-12 w-full bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!category) return null

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/categories">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              <code className="bg-muted px-1 py-0.5 rounded">@{category.slug}</code>
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground">{category.description}</p>
        {category.look_and_feel && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Look & Feel:</span> {category.look_and_feel}
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">
            Assets
            {category.counts.products > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {category.counts.products}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="angled-shots">
            Angled Shots
            {category.counts.angled_shots > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {category.counts.angled_shots}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="backgrounds">
            Backgrounds
            {category.counts.backgrounds > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {category.counts.backgrounds}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="composites">Composites</TabsTrigger>
          <TabsTrigger value="copy">Copy</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="final-assets">Final Assets</TabsTrigger>
          <TabsTrigger value="ad-export">Ad Export</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <ProductList categoryId={category.id} />
        </TabsContent>

        <TabsContent value="angled-shots" className="space-y-4">
          <AngledShotsList categoryId={category.id} />
        </TabsContent>

        <TabsContent value="backgrounds">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 3</p>
            <p className="text-sm text-muted-foreground mt-2">
              AI-generated backgrounds matching your category look & feel
            </p>
          </div>
        </TabsContent>

        <TabsContent value="composites">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 3</p>
            <p className="text-sm text-muted-foreground mt-2">
              Composite images combining products with backgrounds
            </p>
          </div>
        </TabsContent>

        <TabsContent value="copy">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 4</p>
            <p className="text-sm text-muted-foreground mt-2">
              AI-generated marketing copy with GPT-4o
            </p>
          </div>
        </TabsContent>

        <TabsContent value="guidelines">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 5</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload design guidelines and safe zones
            </p>
          </div>
        </TabsContent>

        <TabsContent value="final-assets">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 6</p>
            <p className="text-sm text-muted-foreground mt-2">
              Final composed creatives with all elements
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ad-export">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Coming in Phase 7</p>
            <p className="text-sm text-muted-foreground mt-2">
              Export ads in multiple aspect ratios
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
