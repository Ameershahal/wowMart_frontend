import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import cache from '../../utils/cache'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  // Section mapping: display name -> filter identifier
  const [sectionMapping, setSectionMapping] = useState({
    'Featured Products': 'Featured Products',
    'Trending Toys': 'Trending Toys',
    'Trending Gadgets': 'Trending Gadgets',
    'Trending Building Sets': 'Trending Building Sets'
  })
  const [availableSections, setAvailableSections] = useState([
    'Featured Products',
    'Trending Toys',
    'Trending Gadgets',
    'Trending Building Sets'
  ])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '0',
    images: [],
    rating: '0',
    reviewCount: '0',
    homePageSections: [],
    freeShipping: true,
    returnDays: '30',
    shippingCharge: '0'
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSectionNames()
  }, [])

  const fetchSectionNames = async () => {
    try {
      const response = await api.get('/admin/settings/homepage-sections')
      if (response.data && response.data.sections) {
        // Get the actual section display names from homepage settings
        // These are the exact names shown on the homepage
        const sections = response.data.sections
        const featuredDisplay = sections.featuredProducts || 'Featured Products'
        const toysDisplay = sections.trendingToys || 'Trending Toys'
        const gadgetsDisplay = sections.trendingGadgets || 'Trending Gadgets'
        const buildingSetsDisplay = sections.trendingBuildingSets || 'Trending Building Sets'
        
        // Set display names (what admin sees)
        setAvailableSections([
          featuredDisplay,
          toysDisplay,
          gadgetsDisplay,
          buildingSetsDisplay
        ])
        
        // Create mapping: display name -> filter identifier (used for backend)
        // The filter identifiers are always the standard names
        setSectionMapping({
          [featuredDisplay]: 'Featured Products',
          [toysDisplay]: 'Trending Toys',
          [gadgetsDisplay]: 'Trending Gadgets',
          [buildingSetsDisplay]: 'Trending Building Sets'
        })
      }
    } catch (error) {
      console.error('Error fetching section names:', error)
      // Keep default sections if API fails
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      console.log(response.data[0]);
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories')
      const categoryList = response.data || []
      
      const defaultCategories = [
        { _id: 'toys', categorySlug: 'toys', name: 'Toys' },
        { _id: 'gadgets', categorySlug: 'gadgets', name: 'Gadgets' },
        { _id: 'building-sets', categorySlug: 'building-sets', name: 'Building Sets' },
        { _id: 'electronics', categorySlug: 'electronics', name: 'Electronics' },
        { _id: 'games', categorySlug: 'games', name: 'Games' }
      ]
      
      const adminCategorySlugs = new Set(categoryList.map(cat => cat.categorySlug))
      const uniqueDefaultCategories = defaultCategories.filter(
        cat => !adminCategorySlugs.has(cat.categorySlug)
      )
      
      setCategories([...categoryList, ...uniqueDefaultCategories])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([
        { _id: 'toys', categorySlug: 'toys', name: 'Toys' },
        { _id: 'gadgets', categorySlug: 'gadgets', name: 'Gadgets' },
        { _id: 'building-sets', categorySlug: 'building-sets', name: 'Building Sets' },
        { _id: 'electronics', categorySlug: 'electronics', name: 'Electronics' },
        { _id: 'games', categorySlug: 'games', name: 'Games' }
      ])
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSectionToggle = (section) => {
    setFormData({
      ...formData,
      homePageSections: formData.homePageSections.includes(section)
        ? formData.homePageSections.filter(s => s !== section)
        : [...formData.homePageSections, section]
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length + imagePreview.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      alert('Only JPEG, PNG, WEBP, and GIF images are allowed')
      return
    }

    // Validate file sizes (max 5MB per image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 5MB')
      return
    }

    setImageFiles([...imageFiles, ...files])

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreview(imagePreview.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const uploadImages = async () => {
  if (imageFiles.length === 0) return [];

  setUploadingImages(true);

  try {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("image", file);
    });

    const response = await api.post(
      "/admin/products/upload-images",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data.urls;
  } finally {
    setUploadingImages(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.name || !formData.description || !formData.category || !formData.price) {
        alert('Please fill in all required fields (Name, Description, Category, Price)')
        return
      }

      if (imageFiles.length === 0 && formData.images.length === 0) {
        alert('Please upload at least one image')
        return
      }

      // Upload new images
      const newImageUrls = await uploadImages()
      
      // Combine existing images with newly uploaded ones
      const allImages = [...formData.images, ...newImageUrls]

      // Ensure freeShipping and returnDays are properly set
      const freeShippingValue = formData.freeShipping !== undefined && formData.freeShipping !== null 
        ? Boolean(formData.freeShipping) 
        : true;
      const returnDaysValue = formData.returnDays ? parseInt(formData.returnDays) || 30 : 30;
      const shippingChargeValue = formData.shippingCharge ? parseFloat(formData.shippingCharge) || 0 : 0;
      
      console.log('Form data before creating productData:', {
        freeShipping: formData.freeShipping,
        freeShippingType: typeof formData.freeShipping,
        returnDays: formData.returnDays,
        returnDaysType: typeof formData.returnDays,
        shippingCharge: formData.shippingCharge
      });
      
      // Map display section names to filter identifiers for backend
      const mappedSections = formData.homePageSections.map(displayName => 
        sectionMapping[displayName] || displayName
      )
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviewCount: parseInt(formData.reviewCount) || 0,
        images: allImages,
        homePageSections: mappedSections,
        freeShipping: freeShippingValue,
        returnDays: returnDaysValue,
        shippingCharge: shippingChargeValue
      }

      console.log('Sending product data:', productData)
      console.log('Product data freeShipping:', productData.freeShipping, 'type:', typeof productData.freeShipping)
      console.log('Product data returnDays:', productData.returnDays, 'type:', typeof productData.returnDays)

      let updatedProduct
      if (editingProduct) {
        const response = await api.put(`/admin/products/${editingProduct._id}`, productData)
        updatedProduct = response.data
        console.log('Updated product response:', updatedProduct)
        console.log('Updated product freeShipping:', updatedProduct.freeShipping, 'returnDays:', updatedProduct.returnDays)
        // Clear cache for this specific product
        cache.delete(`product_${editingProduct._id}`)
        // Also clear products list cache to refresh listings
        cache.clear()
      } else {
        const response = await api.post('/admin/products', productData)
        updatedProduct = response.data
        // Clear products list cache
        cache.clear()
      }

      setShowAddModal(false)
      setEditingProduct(null)
      setImageFiles([])
      setImagePreview([])
      setFormData({
        name: '', description: '', price: '', originalPrice: '', category: '',
        stock: '0', images: [], rating: '0', reviewCount: '0',
        homePageSections: [], freeShipping: true, returnDays: '30', shippingCharge: '0'
      })
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMessage = error.response?.data?.message || 'Error saving product'
      alert(errorMessage)
    }
  }

  const handleEdit = (product) => {
    console.log('Editing product:', product)
    console.log('Product freeShipping:', product.freeShipping, 'type:', typeof product.freeShipping)
    console.log('Product returnDays:', product.returnDays, 'type:', typeof product.returnDays)
    
    setEditingProduct(product)
    
    // Map filter identifiers back to display names for editing
    const reverseMapping = Object.fromEntries(
      Object.entries(sectionMapping).map(([display, filter]) => [filter, display])
    )
    const displaySections = (product.homePageSections || []).map(filterName => 
      reverseMapping[filterName] || filterName
    )
    
    const formDataToSet = {
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || product.price?.toString() || '',
      category: product.category || '',
      stock: product.stockQuantity?.toString() || '0',
      images: product.images || [],
      rating: product.rating?.toString() || '0',
      reviewCount: product.reviewCount?.toString() || '0',
      homePageSections: displaySections,
      freeShipping: product.freeShipping !== undefined ? Boolean(product.freeShipping) : true,
      returnDays: product.returnDays !== undefined ? product.returnDays.toString() : '30',
      shippingCharge: product.shippingCharge !== undefined ? product.shippingCharge.toString() : '0'
    }
    console.log('Setting form data:', formDataToSet)
    setFormData(formDataToSet)
    setImageFiles([])
    setImagePreview([])
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null)
            setImageFiles([])
            setImagePreview([])
            setFormData({
              name: '', description: '', price: '', originalPrice: '', category: '',
              stock: '0', images: [], rating: '0', reviewCount: '0',
              homePageSections: [], freeShipping: true, returnDays: '30', shippingCharge: '0'
            })
            setShowAddModal(true)
          }}
          className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-800 transition-colors border border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {product.images && product.images[0] && (
                        <img
                          src={`${product.images[0]}`}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded border border-gray-200"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm text-black">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.description?.substring(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-black">₹{product.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.stockQuantity || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      (product.stockQuantity || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(product.stockQuantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-xs font-medium text-black hover:text-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600">No products found</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-base font-semibold text-black">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingProduct ? 'Update product information' : 'Create a new product'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingProduct(null)
                  setImageFiles([])
                  setImagePreview([])
                }}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.categorySlug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Return Days</label>
                  <input
                    type="number"
                    name="returnDays"
                    value={formData.returnDays}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of days customers can return this product</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-2">Shipping Charge (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="shippingCharge"
                    value={formData.shippingCharge}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shipping charge for this product (₹0 for free shipping)</p>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="freeShipping"
                    checked={formData.freeShipping}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="text-sm font-medium text-black">Free Shipping</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Enable free shipping for this product (overrides shipping charge)</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white text-sm text-black resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-2">Product Images *</label>
                <p className="text-xs text-gray-500 mb-3">Upload up to 5 images (JPEG, PNG, WEBP, GIF - Max 5MB each)</p>
                
                {/* Existing Images (when editing) */}
                {editingProduct && formData.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Current Images:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-yellow-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-black mb-2">Home Page Sections</label>
                <p className="text-xs text-gray-500 mb-3">Select which sections this product should appear in on the home page</p>
                <div className="space-y-2">
                  {availableSections.map((section) => (
                    <label key={section} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.homePageSections.includes(section)}
                        onChange={() => handleSectionToggle(section)}
                        className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                      />
                      <span className="text-sm text-black">{section}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingProduct(null)
                    setImageFiles([])
                    setImagePreview([])
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImages}
                  className="px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImages ? 'Uploading...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts