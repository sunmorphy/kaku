'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit3, Save, X, FolderOpen, Loader2, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiRequest, compressImage } from '@/lib/utils'
import { Project, Category } from '@/types'
import { ConfirmDialog } from '@/components/ui/dialog'
import { ProjectCard } from '@/components/cards'
import { generateSlug } from '@/utils/slug'

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  interface ImageItem {
    id: string;
    type: 'existing' | 'new';
    url: string;
    file?: File;
  }

  const [formData, setFormData] = useState({
    coverImage: null as File | null,
    title: '',
    description: '',
    slug: '',
    categoryIds: [] as number[],
    type: 'portfolio' as 'portfolio' | 'scratch',
    published: true,
  })
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [imagesList, setImagesList] = useState<ImageItem[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; projectId: number | null }>({
    open: false,
    projectId: null,
  })

  useEffect(() => {
    Promise.all([fetchCategories()])
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [currentPage, searchTerm, selectedCategoryIds])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      if (selectedCategoryIds.length > 0) {
        params.append('categoryIds', JSON.stringify(selectedCategoryIds))
      }

      const response = await apiRequest<{
        data: Project[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
          hasNextPage: boolean
          hasPrevPage: boolean
        }
      }>(`/projects/my?${params.toString()}`)

      setProjects(response.data)
      setTotalItems(response.pagination.total)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setProjects([])
      setTotalItems(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await apiRequest<Category[]>('/categories/my')
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const createProject = async () => {
    if (!formData.title.trim() || imagesList.length === 0) return

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      if (formData.coverImage) {
        const compressedCoverImage = await compressImage(formData.coverImage)
        formDataToSend.append('coverImage', compressedCoverImage)
      }

      const filesToUpload: File[] = []
      const imageOrder = imagesList.map(item => {
        if (item.type === 'new' && item.file) {
          const fileIndex = filesToUpload.length
          filesToUpload.push(item.file)
          return `new-${fileIndex}`
        }
        return item.url
      })

      // Compress all images and wait for completion
      const compressedImages = await Promise.all(
        filesToUpload.map(image => compressImage(image))
      )

      // Append all compressed images to FormData
      compressedImages.forEach(compressedImage => {
        formDataToSend.append('images', compressedImage)
      })

      formDataToSend.append('imageOrder', JSON.stringify(imageOrder))
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds))
      formDataToSend.append('type', formData.type)
      formDataToSend.append('published', formData.published.toString())

      await apiRequest<Project>('/projects', {
        method: 'POST',
        body: formDataToSend,
      })

      resetForm()
      await fetchProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const updateProject = async (id: number) => {
    if (!formData.title.trim()) return

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()

      if (formData.coverImage) {
        const compressedCoverImage = await compressImage(formData.coverImage)
        formDataToSend.append('coverImage', compressedCoverImage)
      }

      const filesToUpload: File[] = []
      const imageOrder = imagesList.map(item => {
        if (item.type === 'new' && item.file) {
          const fileIndex = filesToUpload.length
          filesToUpload.push(item.file)
          return `new-${fileIndex}`
        }
        return item.url
      })

      const compressedImages = await Promise.all(
        filesToUpload.map(file => compressImage(file))
      )

      compressedImages.forEach(compressedImage => {
        formDataToSend.append('images', compressedImage)
      })

      formDataToSend.append('imageOrder', JSON.stringify(imageOrder))
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('categoryIds', JSON.stringify(formData.categoryIds))
      formDataToSend.append('type', formData.type)
      formDataToSend.append('published', formData.published.toString())

      await apiRequest<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      resetForm()
      await fetchProjects()
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const showDeleteDialog = (id: number) => {
    setDeleteDialog({ open: true, projectId: id })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.projectId) return

    try {
      await apiRequest(`/projects/${deleteDialog.projectId}`, { method: 'DELETE' })
      await fetchProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    } finally {
      setDeleteDialog({ open: false, projectId: null })
    }
  }

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setFormData({
      coverImage: null,
      title: project.title,
      description: project.description || '',
      slug: project.slug || '',
      categoryIds: project.project_categories?.map(pc => pc.category.id) || [],
      type: (project.type as 'portfolio' | 'scratch') || 'portfolio',
      published: project.published ?? true,
    })
    setCoverImagePreview(project.cover_image_path || null)
    setImagesList(project.batch_image_path.map((url, i) => ({
      id: `existing-${i}-${url}`,
      type: 'existing',
      url
    })))
    setShowCreateForm(true)
  }

  const resetForm = () => {
    setFormData({
      coverImage: null,
      title: '',
      description: '',
      slug: '',
      categoryIds: [],
      type: 'portfolio',
      published: true,
    })
    setCoverImagePreview(null)
    setImagesList([])
    setShowCreateForm(false)
    setEditingId(null)
  }

  const handleCategoryToggle = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }))
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData({ ...formData, coverImage: file })

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setCoverImagePreview(null)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (typeof index === 'number') {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagesList(prev => prev.map((item, i) => i === index ? {
          ...item,
          type: 'new',
          url: e.target?.result as string,
          file
        } : item))
      }
      reader.readAsDataURL(file)
    } else {
      let loadedCount = 0
      const newItems: ImageItem[] = []
      files.forEach((file, fileIndex) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          newItems[fileIndex] = {
            id: `new-${Date.now()}-${fileIndex}-${file.name}`,
            type: 'new',
            url: e.target?.result as string,
            file
          }
          loadedCount++

          if (loadedCount === files.length) {
            setImagesList(prev => [...prev, ...newItems])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImagesList(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newList = [...imagesList]
    const draggedItem = newList[draggedIndex]
    newList.splice(draggedIndex, 1)
    newList.splice(index, 0, draggedItem)
    setDraggedIndex(index)
    setImagesList(newList)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggedIndex(index)
  }

  const handleTouchMove = (e: React.TouchEvent, currentIndex: number) => {
    if (draggedIndex === null) return
    const touch = e.touches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!element) return

    const card = element.closest('[data-index]')
    if (!card) return

    const targetIndex = parseInt(card.getAttribute('data-index') || '')
    if (isNaN(targetIndex) || targetIndex === draggedIndex) return

    const newList = [...imagesList]
    const draggedItem = newList[draggedIndex]
    newList.splice(draggedIndex, 1)
    newList.splice(targetIndex, 0, draggedItem)
    
    setDraggedIndex(targetIndex)
    setImagesList(newList)
  }

  const handleTouchEnd = () => {
    setDraggedIndex(null)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategoryIds])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage your project collections</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        {!showCreateForm && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="relative w-full sm:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="pl-10 w-full h-10 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left text-gray-900 flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedCategoryIds.length === 0
                    ? 'All Categories'
                    : selectedCategoryIds.length === 1
                      ? categories.find(c => c.id === selectedCategoryIds[0])?.name
                      : `${selectedCategoryIds.length} categories selected`
                  }
                </span>
                <svg className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedCategoryIds([])
                        setCategoryDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors text-gray-900"
                    >
                      Clear All
                    </button>
                    {categories.map(category => (
                      <label key={category.id} className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds([...selectedCategoryIds, category.id])
                            } else {
                              setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== category.id))
                            }
                          }}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-900">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Project' : 'Add New Project'}
            </CardTitle>
            <CardDescription>
              {editingId ? 'Update project details' : 'Create a new project with multiple images'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image
                </label>
                <div className="relative">
                  {coverImagePreview ? (
                    <div className="relative w-full max-w-sm">
                      <img
                        src={coverImagePreview}
                        alt="Preview"
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImagePreview(null)
                          setFormData({ ...formData, coverImage: null })
                          // Reset file input
                          const fileInput = document.getElementById('image') as HTMLInputElement
                          if (fileInput) fileInput.value = ''
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById('image')?.click()}
                        className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full px-3 py-1 text-sm hover:bg-blue-600 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById('image')?.click()}
                      className="w-full max-w-sm aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-600 text-center">Click to upload image</p>
                      <p className="text-gray-400 text-sm">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                  placeholder="Project title"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="URL-friendly slug (auto-generated if empty)"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Images {!editingId && <span className="text-red-500">*</span>}
                </label>

                {/* Add Images Button */}
                <div className="mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('add-images')?.click()}
                    className="w-full sm:w-auto"
                    disabled={submitting}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Images
                  </Button>
                  <input
                    id="add-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e)}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Select one or more images to add to this project
                  </p>
                </div>

                {/* Image Previews */}
                {imagesList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {imagesList.map((item, index) => (
                      <div
                        key={item.id}
                        draggable={!submitting}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={(e) => handleTouchMove(e, index)}
                        onTouchEnd={handleTouchEnd}
                        data-index={index}
                        className={`relative group border border-gray-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none touch-none ${
                          draggedIndex === index ? 'opacity-40 scale-95 border-blue-500 border-2' : 'opacity-100 hover:shadow-md'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={`Image ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById(`image-${index}`)?.click()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full px-2 py-1 text-xs hover:bg-blue-600 transition-colors shadow-lg z-10"
                        >
                          Change
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded z-10">
                          {index + 1}
                        </div>
                        <input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, index)}
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        disabled={submitting}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.categoryIds.includes(category.id)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No categories available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <span className="text-sm font-medium text-gray-700">Published</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Uncheck to save as draft without publishing</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => editingId ? updateProject(editingId) : createProject()}
                  disabled={submitting || !formData.title.trim() || imagesList.length === 0}
                  className="w-full sm:w-auto"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {submitting
                    ? (editingId ? 'Updating...' : 'Creating...')
                    : (editingId ? 'Update' : 'Create')
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!showCreateForm && (
        projects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                {searchTerm || selectedCategoryIds.length > 0 ? <Search className="w-12 h-12 mx-auto" /> : <FolderOpen className="w-12 h-12 mx-auto" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategoryIds.length > 0 ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategoryIds.length > 0
                  ? 'No projects match your current search and filter criteria. Try adjusting your search terms or filters.'
                  : 'Create your first project collection.'
                }
              </p>
              {!searchTerm && selectedCategoryIds.length === 0 && (
                <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) :
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={startEdit}
                  onDelete={showDeleteDialog}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {endIndex} of {totalItems} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
      )}

      {!showCreateForm && projects.length > 0 && totalPages <= 1 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {totalItems} project{totalItems !== 1 ? 's' : ''}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, projectId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </div>
  )
}