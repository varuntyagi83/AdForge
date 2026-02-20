'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Image } from 'lucide-react'
import { toast } from 'sonner'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description: string | null
    created_at: string
  }
  categoryId: string
  onDeleted: () => void
}

export function ProductCard({ product, categoryId, onDeleted }: ProductCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/categories/${categoryId}/products/${product.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        toast.success('Product deleted successfully!')
        onDeleted()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-square mb-3 rounded-md bg-muted flex items-center justify-center overflow-hidden relative">
          <div className="text-center text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-2" />
            <p className="text-xs">No images yet</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-1">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={deleting}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0 images</span>
            <span>{new Date(product.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
