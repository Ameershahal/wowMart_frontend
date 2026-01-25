import { useState, useEffect } from 'react'
import api from '../../services/api'

function AdminSettings() {
  const [buttonColor, setButtonColor] = useState('#2563eb')
  const [sectionNames, setSectionNames] = useState({
    shopByCategory: 'Shop by Category',
    trendingCollections: 'Trending Collections',
    trendingToys: 'Trending Toys',
    trendingGadgets: 'Trending Gadgets',
    trendingBuildingSets: 'Trending Building Sets',
    featuredProducts: 'Featured Products',
    customerReviews: 'What Our Customers Say'
  })
  const [announcement, setAnnouncement] = useState({
    message: '',
    backgroundColor: '#fbbf24',
    textColor: '#000000',
    linkUrl: '',
    linkText: '',
    isActive: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSections, setSavingSections] = useState(false)
  const [savingAnnouncement, setSavingAnnouncement] = useState(false)
  const [savingVideos, setSavingVideos] = useState(false)
  const [message, setMessage] = useState('')
  const [sectionMessage, setSectionMessage] = useState('')
  const [announcementMessage, setAnnouncementMessage] = useState('')
  const [videosMessage, setVideosMessage] = useState('')
  const [videos, setVideos] = useState([])
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAllData, setDeletingAllData] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchButtonColor()
    fetchSectionNames()
    fetchAnnouncement()
    fetchVideos()
  }, [])

  const fetchButtonColor = async () => {
    try {
      const response = await api.get('/admin/settings/button-color')
      setButtonColor(response.data.color)
    } catch (error) {
      console.error('Error fetching button color:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSectionNames = async () => {
    try {
      const response = await api.get('/admin/settings/homepage-sections')
      if (response.data.sections) {
        setSectionNames(response.data.sections)
      }
    } catch (error) {
      console.error('Error fetching section names:', error)
    }
  }

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get('/admin/announcement')
      if (response.data) {
        setAnnouncement({
          message: response.data.message || '',
          backgroundColor: response.data.backgroundColor || '#fbbf24',
          textColor: response.data.textColor || '#000000',
          linkUrl: response.data.linkUrl || '',
          linkText: response.data.linkText || '',
          isActive: response.data.isActive || false
        })
      }
    } catch (error) {
      console.error('Error fetching announcement:', error)
    }
  }

  const fetchVideos = async () => {
    try {
      const response = await api.get('/admin/settings/little-voices-videos')
      if (response.data.videos) {
        setVideos(response.data.videos)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const handleVideoChange = (index, value) => {
    const newVideos = [...videos]
    newVideos[index] = { ...newVideos[index], src: value }
    setVideos(newVideos)
  }

  const handleAddVideo = () => {
    setVideos([...videos, { id: Date.now(), src: '' }])
  }

  const handleRemoveVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index)
    setVideos(newVideos)
  }

  const handleSaveVideos = async () => {
    setSavingVideos(true)
    setVideosMessage('')
    try {
      // Filter out videos with empty src
      const validVideos = videos.filter(video => video.src && video.src.trim() !== '')
      
      if (validVideos.length === 0) {
        setVideosMessage('Error: At least one video URL is required.')
        setSavingVideos(false)
        return
      }

      // Ensure each video has an id
      const videosWithIds = validVideos.map((video, index) => ({
        id: video.id || index + 1,
        src: video.src.trim()
      }))

      await api.put('/admin/settings/little-voices-videos', { videos: videosWithIds })
      setVideos(videosWithIds)
      setVideosMessage('Little Voices videos updated successfully!')
      setTimeout(() => setVideosMessage(''), 5000)
    } catch (error) {
      setVideosMessage('Error updating videos: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingVideos(false)
    }
  }

  const handleSectionNameChange = (key, value) => {
    setSectionNames({
      ...sectionNames,
      [key]: value
    })
  }

  const handleSaveSections = async () => {
    setSavingSections(true)
    setSectionMessage('')
    try {
      await api.put('/admin/settings/homepage-sections', { sections: sectionNames })
      setSectionMessage('Home page section names updated successfully!')
      setTimeout(() => setSectionMessage(''), 5000)
    } catch (error) {
      setSectionMessage('Error updating section names: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingSections(false)
    }
  }

  const handleColorChange = (e) => {
    setButtonColor(e.target.value)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.put('/admin/settings/button-color', { color: buttonColor })
      setMessage('Button color updated successfully! Changes will appear on all pages.')
      setTimeout(() => setMessage(''), 5000)
      // Trigger a window event to notify all components to refresh
      window.dispatchEvent(new CustomEvent('buttonColorChanged', { detail: { color: buttonColor } }))
    } catch (error) {
      setMessage('Error updating button color: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleAnnouncementChange = (field, value) => {
    setAnnouncement({
      ...announcement,
      [field]: value
    })
  }

  const handleSaveAnnouncement = async () => {
    setSavingAnnouncement(true)
    setAnnouncementMessage('')
    try {
      await api.post('/admin/announcement', announcement)
      setAnnouncementMessage('Announcement saved successfully!')
      setTimeout(() => setAnnouncementMessage(''), 5000)
    } catch (error) {
      setAnnouncementMessage('Error saving announcement: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingAnnouncement(false)
    }
  }

  const presetColors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Indigo', value: '#4f46e5' }
  ]

  const announcementPresetColors = [
    { name: 'Yellow', value: '#fbbf24' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Black', value: '#000000' }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Button Settings</h1>
            <p className="text-gray-600">Customize the color of all "Buy Now" buttons across your website</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Buy Now Button Color
              </label>
              
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={handleColorChange}
                      className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={buttonColor}
                      onChange={handleColorChange}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                
                {/* Preview */}
                <div className="flex-shrink-0">
                  <button
                    className="px-6 py-3 rounded-md font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    style={{ backgroundColor: buttonColor }}
                    disabled
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Select Colors
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {presetColors.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setButtonColor(preset.value)}
                    className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      buttonColor === preset.value 
                        ? 'border-black ring-2 ring-yellow-400' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This color will be applied to all "Buy Now" buttons on:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Product cards</li>
                  <li>Product detail page</li>
                  <li>Cart page</li>
                  <li>Checkout page</li>
                  <li>Banner slider</li>
                </ul>
              </p>
            </div>
          </div>
        </div>

        {/* Home Page Section Names */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Home Page Section Names</h1>
            <p className="text-gray-600">Customize the names of sections displayed on the home page</p>
          </div>

          {sectionMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              sectionMessage.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {sectionMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shop by Category Section
              </label>
              <input
                type="text"
                value={sectionNames.shopByCategory}
                onChange={(e) => handleSectionNameChange('shopByCategory', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trending Collections Section
              </label>
              <input
                type="text"
                value={sectionNames.trendingCollections}
                onChange={(e) => handleSectionNameChange('trendingCollections', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trending Toys Section
              </label>
              <input
                type="text"
                value={sectionNames.trendingToys}
                onChange={(e) => handleSectionNameChange('trendingToys', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trending Gadgets Section
              </label>
              <input
                type="text"
                value={sectionNames.trendingGadgets}
                onChange={(e) => handleSectionNameChange('trendingGadgets', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trending Building Sets Section
              </label>
              <input
                type="text"
                value={sectionNames.trendingBuildingSets}
                onChange={(e) => handleSectionNameChange('trendingBuildingSets', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Featured Products Section
              </label>
              <input
                type="text"
                value={sectionNames.featuredProducts}
                onChange={(e) => handleSectionNameChange('featuredProducts', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Customer Reviews Section
              </label>
              <input
                type="text"
                value={sectionNames.customerReviews}
                onChange={(e) => handleSectionNameChange('customerReviews', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveSections}
                disabled={savingSections}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {savingSections ? 'Saving...' : 'Save Section Names'}
              </button>
            </div>
          </div>
        </div>

        {/* Announcement Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Top Announcement Banner</h1>
            <p className="text-gray-600">Manage the announcement banner displayed at the top of the website</p>
          </div>

          {announcementMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              announcementMessage.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {announcementMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Announcement Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Announcement Message *
              </label>
              <textarea
                value={announcement.message}
                onChange={(e) => handleAnnouncementChange('message', e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                rows="3"
                placeholder="Enter your announcement message (max 500 characters)"
                maxLength="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {announcement.message.length}/500 characters
              </p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={announcement.backgroundColor}
                    onChange={(e) => handleAnnouncementChange('backgroundColor', e.target.value)}
                    className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={announcement.backgroundColor}
                    onChange={(e) => handleAnnouncementChange('backgroundColor', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="#fbbf24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={announcement.textColor}
                    onChange={(e) => handleAnnouncementChange('textColor', e.target.value)}
                    className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={announcement.textColor}
                    onChange={(e) => handleAnnouncementChange('textColor', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Preset Colors */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Select Background Colors
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {announcementPresetColors.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleAnnouncementChange('backgroundColor', preset.value)}
                    className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                      announcement.backgroundColor === preset.value 
                        ? 'border-black ring-2 ring-yellow-400' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Optional Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link URL (Optional)
                </label>
                <input
                  type="text"
                  value={announcement.linkUrl}
                  onChange={(e) => handleAnnouncementChange('linkUrl', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="/products or https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link Text (Optional)
                </label>
                <input
                  type="text"
                  value={announcement.linkText}
                  onChange={(e) => handleAnnouncementChange('linkText', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Shop Now"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcementActive"
                checked={announcement.isActive}
                onChange={(e) => handleAnnouncementChange('isActive', e.target.checked)}
                className="w-5 h-5 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
              />
              <label htmlFor="announcementActive" className="text-sm font-semibold text-gray-700">
                Show announcement on website
              </label>
            </div>

            {/* Preview */}
            {announcement.message && (
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preview
                </label>
                <div 
                  className="w-full py-2 px-4 text-center text-sm font-semibold rounded"
                  style={{
                    backgroundColor: announcement.backgroundColor,
                    color: announcement.textColor
                  }}
                >
                  <div className="flex items-center justify-center gap-4">
                    <span>{announcement.message}</span>
                    {announcement.linkUrl && announcement.linkText && (
                      <span className="underline">{announcement.linkText}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveAnnouncement}
                disabled={savingAnnouncement || !announcement.message.trim()}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {savingAnnouncement ? 'Saving...' : 'Save Announcement'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The announcement banner will appear at the very top of the website, above the navigation bar. Only one announcement can be active at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Little Voices Videos Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Little Voices Videos</h1>
            <p className="text-gray-600">Manage video links for the "Little Voices Speak!" section on the homepage</p>
          </div>

          {videosMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              videosMessage.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {videosMessage}
            </div>
          )}

          <div className="space-y-4">
            {videos.map((video, index) => (
              <div key={video.id || index} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video {index + 1} URL *
                    </label>
                    <input
                      type="text"
                      value={video.src || ''}
                      onChange={(e) => handleVideoChange(index, e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="https://example.com/video.mp4"
                    />
                    {video.src && (
                      <div className="mt-2 text-xs text-gray-500">
                        <a href={video.src} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {video.src.length > 60 ? video.src.substring(0, 60) + '...' : video.src}
                        </a>
                      </div>
                    )}
                  </div>
                  {videos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="mt-8 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddVideo}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors font-medium"
            >
              + Add Video
            </button>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSaveVideos}
                disabled={savingVideos || videos.length === 0}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {savingVideos ? 'Saving...' : 'Save Videos'}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Enter the direct video URL (e.g., https://example.com/video.mp4). Videos will be displayed in the "Little Voices Speak!" section on the homepage in the order listed here. At least one video is required.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone - Delete All Data */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6 md:p-8 mt-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-2">⚠️ Danger Zone</h2>
            <p className="text-gray-600">Permanently delete all data from the website. This action cannot be undone!</p>
          </div>

          {!showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Delete All Data</h3>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mb-6 space-y-1">
                <li>All Products</li>
                <li>All Users (except admin accounts)</li>
                <li>All Orders</li>
                <li>All Carts</li>
                <li>All Banners</li>
                <li>All Categories</li>
                <li>All Blogs</li>
                <li>All Reviews</li>
                <li>All Wishlists</li>
                <li>All Announcements</li>
              </ul>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Delete All Data
              </button>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">⚠️ Final Confirmation Required</h3>
              <p className="text-sm text-red-700 mb-4">
                This action is <strong>IRREVERSIBLE</strong>. All data will be permanently deleted.
              </p>
              <p className="text-sm text-red-700 mb-4 font-semibold">
                Type <span className="bg-red-200 px-2 py-1 rounded">DELETE ALL</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE ALL to confirm"
                className="w-full px-4 py-3 rounded-lg border-2 border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (deleteConfirmText !== 'DELETE ALL') {
                      alert('Please type "DELETE ALL" exactly to confirm')
                      return
                    }

                    if (!window.confirm('Are you absolutely sure? This will delete ALL data and cannot be undone!')) {
                      return
                    }

                    setDeletingAllData(true)
                    try {
                      await api.delete('/admin/delete-all-data')
                      alert('All data has been deleted successfully!')
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                      // Optionally redirect or reload
                      window.location.reload()
                    } catch (error) {
                      console.error('Error deleting all data:', error)
                      alert(error.response?.data?.message || 'Error deleting all data')
                    } finally {
                      setDeletingAllData(false)
                    }
                  }}
                  disabled={deletingAllData || deleteConfirmText !== 'DELETE ALL'}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deletingAllData ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete All Data'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  disabled={deletingAllData}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
