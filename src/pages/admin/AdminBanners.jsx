import { useState, useEffect } from 'react'
import api from '../../services/api'

function AdminBanners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    desktopImageUrl: '',
    mobileImageUrl: '',
    linkUrl: '/products',
    buttonText: 'Shop Now',
    buttonColor: '',
    isActive: true,
    order: 0
  })
  const [uploading, setUploading] = useState({ desktop: false, mobile: false })
  const [selectedFiles, setSelectedFiles] = useState({ desktop: null, mobile: null })
  const [previewUrls, setPreviewUrls] = useState({ desktop: null, mobile: null })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await api.get('/admin/banners')
      console.log(response.data[0].imageUrl,"image url");
      
      setBanners(response.data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [type]: file }))
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => ({ ...prev, [type]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = async (type) => {
    const file = selectedFiles[type]
    if (!file) {
      alert('Please select a file to upload')
      return null
    }

    setUploading(prev => ({ ...prev, [type]: true }))
    try {
      const formDataToUpload = new FormData()
      formDataToUpload.append('image', file)
      formDataToUpload.append('type', type)

      const response = await api.post('/admin/banners/upload', formDataToUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Construct the full image URL
      const imageUrl = response.data.imageUrl.startsWith('http') 
        ? response.data.imageUrl 
        : response.data.imageUrl
      
      // Set the uploaded image URL based on type
      setFormData(prev => ({
        ...prev,
        [`${type}ImageUrl`]: imageUrl
      }))
      
      // Clear file selection but keep preview
      setSelectedFiles(prev => ({ ...prev, [type]: null }))
      
      alert(`${type === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully!`)
      return imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + (error.response?.data?.message || error.message))
      return null
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Upload files if they exist but haven't been uploaded yet
      if (selectedFiles.desktop && !formData.desktopImageUrl) {
        const uploadedUrl = await handleFileUpload('desktop')
        if (!uploadedUrl) {
          return
        }
      }
      if (selectedFiles.mobile && !formData.mobileImageUrl) {
        const uploadedUrl = await handleFileUpload('mobile')
        if (!uploadedUrl) {
          return
        }
      }

      // At least one image is required
      if (!formData.desktopImageUrl && !formData.mobileImageUrl) {
        alert('Please upload at least one image (desktop or mobile)')
        return
      }

      const bannerData = {
        ...formData
      }

      if (editingBanner) {
        await api.put(`/admin/banners/${editingBanner._id}`, bannerData)
      } else {
        await api.post('/admin/banners', bannerData)
      }

      setShowAddModal(false)
      setEditingBanner(null)
      setFormData({ desktopImageUrl: '', mobileImageUrl: '', linkUrl: '/products', buttonText: 'Shop Now', buttonColor: '', isActive: true, order: 0 })
      setSelectedFiles({ desktop: null, mobile: null })
      setPreviewUrls({ desktop: null, mobile: null })
      fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('Error saving banner: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleEdit = (banner) => {
    setEditingBanner(banner)
    setFormData({
      desktopImageUrl: banner.desktopImageUrl || banner.imageUrl || '',
      mobileImageUrl: banner.mobileImageUrl || banner.imageUrl || '',
      linkUrl: banner.linkUrl || '/products',
      buttonText: banner.buttonText || 'Shop Now',
      buttonColor: banner.buttonColor || '',
      isActive: banner.isActive,
      order: banner.order
    })
    setPreviewUrls({
      desktop: banner.desktopImageUrl || banner.imageUrl || null,
      mobile: banner.mobileImageUrl || banner.imageUrl || null
    })
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      await api.delete(`/admin/banners/${id}`)
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Error deleting banner: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingBanner(null)
    setFormData({ desktopImageUrl: '', mobileImageUrl: '', linkUrl: '/products', buttonText: 'Shop Now', buttonColor: '', isActive: true, order: 0 })
    setSelectedFiles({ desktop: null, mobile: null })
    setPreviewUrls({ desktop: null, mobile: null })
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
        <h1 className="text-2xl font-semibold text-black">Banner Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add New Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600">No banners found. Add your first banner!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={`https://wowmart-h0ky.onrender.com${banner.imageUrl}`}
                  alt="Banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found'
                  }}
                />
                {!banner.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Order: {banner.order}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="flex-1 bg-yellow-400 text-black px-3 py-2 rounded text-sm font-medium hover:bg-yellow-500 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Desktop Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desktop/Laptop Banner Image *
                    <span className="ml-2 text-xs font-normal text-gray-500">(Recommended: 1920x600px)</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'desktop')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleFileUpload('desktop')}
                        disabled={!selectedFiles.desktop || uploading.desktop}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {uploading.desktop ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {previewUrls.desktop && (
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={previewUrls.desktop}
                          alt="Desktop Preview"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="desktopImageUrl"
                      value={formData.desktopImageUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="Or enter desktop image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended size: 1920x600px (16:5 ratio) for best quality on desktop screens
                    </p>
                  </div>
                </div>

                {/* Mobile Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Banner Image *
                    <span className="ml-2 text-xs font-normal text-gray-500">(Recommended: 750x1000px)</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'mobile')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleFileUpload('mobile')}
                        disabled={!selectedFiles.mobile || uploading.mobile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        {uploading.mobile ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {previewUrls.mobile && (
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={previewUrls.mobile}
                          alt="Mobile Preview"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="mobileImageUrl"
                      value={formData.mobileImageUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                      placeholder="Or enter mobile image URL"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended size: 750x1000px (3:4 ratio) for best quality on mobile screens
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link URL *
                  </label>
                  <input
                    type="text"
                    name="linkUrl"
                    value={formData.linkUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="/products or /products?category=toys"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Where the button should navigate (e.g., /products, /products?category=toys, /products/123)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Shop Now"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Text to display on the button (default: "Shop Now")
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Color
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      name="buttonColor"
                      value={formData.buttonColor || '#2563eb'}
                      onChange={handleInputChange}
                      className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="buttonColor"
                      value={formData.buttonColor}
                      onChange={handleInputChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="#2563eb (leave empty to use default)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Custom button color for this banner (hex format, e.g., #2563eb). Leave empty to use the default button color from settings.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first (0 = first)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Active (visible on homepage)
                  </label>
                </div>

                {(formData.desktopImageUrl || formData.mobileImageUrl || previewUrls.desktop || previewUrls.mobile) && (
                  <div className="mt-4 space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    {formData.desktopImageUrl || previewUrls.desktop ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Desktop Preview:</p>
                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={formData.desktopImageUrl || previewUrls.desktop}
                            alt="Desktop Preview"
                            className="w-full h-auto max-h-64 object-contain"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/1920x600?text=Invalid+Image+URL'
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                    {formData.mobileImageUrl || previewUrls.mobile ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Mobile Preview:</p>
                        <div className="border border-gray-300 rounded-lg overflow-hidden max-w-xs">
                          <img
                            src={formData.mobileImageUrl || previewUrls.mobile}
                            alt="Mobile Preview"
                            className="w-full h-auto max-h-64 object-contain"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/750x1000?text=Invalid+Image+URL'
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={!formData.desktopImageUrl && !formData.mobileImageUrl}
                    className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {editingBanner ? 'Update Banner' : 'Add Banner'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
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

export default AdminBanners
