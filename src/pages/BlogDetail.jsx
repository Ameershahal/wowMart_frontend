import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import SEO from '../components/SEO'
import Skeleton from '../components/Skeleton'

function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlog()
  }, [slug])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blogs/${slug}`)
      setBlog(response.data)
    } catch (error) {
      console.error('Error fetching blog:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-4 w-32 mb-8" />
          <Skeleton className="aspect-video w-full rounded-xl mb-8" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="bg-transparent min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-black text-black mb-4">Blog Post Not Found</h1>
            <Link to="/blog" className="text-yellow-600 hover:text-yellow-500 font-semibold">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-transparent">
      <SEO
        title={`${blog.title} - WowMart Blog`}
        description={blog.excerpt || blog.content.substring(0, 160)}
        type="article"
      />
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link 
          to="/blog" 
          className="inline-flex items-center text-yellow-600 hover:text-yellow-500 font-semibold mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <article className="bg-white rounded-xl shadow-lg p-6 md:p-8 lg:p-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                {blog.category}
              </span>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-4">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 border-b border-gray-200 pb-4">
              <span className="font-semibold">{blog.author}</span>
              <span>•</span>
              <span>{formatDate(blog.publishedAt)}</span>
              <span>•</span>
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          <div 
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            style={{ 
              fontSize: '1.125rem',
              lineHeight: '1.75rem'
            }}
          >
            {blog.content}
          </div>
        </article>
      </div>
    </div>
  )
}

export default BlogDetail
