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
  const [codEnabled, setCodEnabled] = useState(true)
  const [codMessage, setCodMessage] = useState('')
  const [savingCod, setSavingCod] = useState(false)
  const [weightShippingEnabled, setWeightShippingEnabled] = useState(false)
  const [weightKeralaPerKg, setWeightKeralaPerKg] = useState('0')
  const [weightRestPerKg, setWeightRestPerKg] = useState('0')
  const [weightShipMessage, setWeightShipMessage] = useState('')
  const [savingWeightShip, setSavingWeightShip] = useState(false)
  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdMessage, setPwdMessage] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    fetchButtonColor()
    fetchSectionNames()
    fetchAnnouncement()
    fetchVideos()
    fetchCodEnabled()
    fetchWeightShipping()
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

  const fetchCodEnabled = async () => {
    try {
      const response = await api.get('/admin/settings/cod-enabled')
      if (typeof response.data?.codEnabled === 'boolean') {
        setCodEnabled(response.data.codEnabled)
      }
    } catch (error) {
      console.error('Error fetching COD setting:', error)
    }
  }

  const handleSaveCod = async () => {
    setSavingCod(true)
    setCodMessage('')
    try {
      await api.put('/admin/settings/cod-enabled', { codEnabled })
      setCodMessage(codEnabled ? 'Cash on Delivery is enabled for the store.' : 'Cash on Delivery is disabled for the store.')
      setTimeout(() => setCodMessage(''), 5000)
    } catch (error) {
      setCodMessage('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingCod(false)
    }
  }

  const fetchWeightShipping = async () => {
    try {
      const response = await api.get('/admin/settings/weight-shipping')
      if (typeof response.data?.enabled === 'boolean') {
        setWeightShippingEnabled(response.data.enabled)
      }
      const k = response.data?.keralaPerKg
      const r = response.data?.restOfIndiaPerKg ?? response.data?.perKgRate
      setWeightKeralaPerKg(k != null && k !== '' ? String(k) : '0')
      setWeightRestPerKg(r != null && r !== '' ? String(r) : '0')
    } catch (error) {
      console.error('Error fetching weight shipping:', error)
    }
  }

  const handleSaveWeightShipping = async () => {
    setSavingWeightShip(true)
    setWeightShipMessage('')
    try {
      const kerala = parseFloat(weightKeralaPerKg)
      const rest = parseFloat(weightRestPerKg)
      if (!Number.isFinite(kerala) || kerala < 0 || !Number.isFinite(rest) || rest < 0) {
        setWeightShipMessage('Error: Enter valid ₹ per kg for both zones (0 or more).')
        return
      }
      await api.put('/admin/settings/weight-shipping', {
        enabled: weightShippingEnabled,
        keralaPerKg: kerala,
        restOfIndiaPerKg: rest,
      })
      setWeightShipMessage('Weight shipping settings saved.')
      setTimeout(() => setWeightShipMessage(''), 5000)
    } catch (error) {
      setWeightShipMessage('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingWeightShip(false)
    }
  }

  const handleChangePassword = async () => {
    setSavingPwd(true)
    setPwdMessage('')
    try {
      if (!pwdCurrent || !pwdNew) {
        setPwdMessage('Error: Fill in current and new password.')
        return
      }
      if (pwdNew.length < 6) {
        setPwdMessage('Error: New password must be at least 6 characters.')
        return
      }
      if (pwdNew !== pwdConfirm) {
        setPwdMessage('Error: New password and confirmation do not match.')
        return
      }
      await api.put('/admin/change-password', {
        currentPassword: pwdCurrent,
        newPassword: pwdNew,
      })
      setPwdMessage('Password updated successfully. Use your new password next time you log in.')
      setPwdCurrent('')
      setPwdNew('')
      setPwdConfirm('')
      setTimeout(() => setPwdMessage(''), 6000)
    } catch (error) {
      setPwdMessage('Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setSavingPwd(false)
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Admin password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Change admin password</h1>
            <p className="text-gray-600">
              Update the password for your admin login. This does not affect customer accounts.
            </p>
          </div>
          {pwdMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              pwdMessage.startsWith('Error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {pwdMessage}
            </div>
          )}
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                minLength={6}
              />
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={savingPwd}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPwd ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </div>

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

        {/* Cash on Delivery (store-wide) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Cash on Delivery</h1>
            <p className="text-gray-600">
              Turn COD on or off for the whole store. When on, customers still only see COD if every product in the cart has &quot;COD available&quot; enabled on that product.
            </p>
          </div>
          {codMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              codMessage.startsWith('Error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {codMessage}
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
            />
            <span className="text-sm font-semibold text-gray-900">Allow Cash on Delivery at checkout</span>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-8">
            Uncheck to hide COD and block COD orders (online payment only). Per-product COD is managed in Products.
          </p>
          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleSaveCod}
              disabled={savingCod}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {savingCod ? 'Saving...' : 'Save COD setting'}
            </button>
          </div>
        </div>

        {/* Weight-based shipping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Shipping by weight (zones)</h1>
            <p className="text-gray-600">
              Set <strong>₹ per kg</strong> for deliveries inside <strong>Kerala</strong> vs <strong>rest of India</strong> (matches the state the customer selects at checkout).
              Set <strong>Weight (kg)</strong> on each product in Products. <strong>Free shipping</strong> lines are excluded from billable weight.
              Totals are recomputed on the server when the order is placed.
            </p>
          </div>
          {weightShipMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              weightShipMessage.startsWith('Error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {weightShipMessage}
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={weightShippingEnabled}
              onChange={(e) => setWeightShippingEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
            />
            <span className="text-sm font-semibold text-gray-900">Enable weight-based shipping</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kerala — ₹ per kg</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={weightKeralaPerKg}
                onChange={(e) => setWeightKeralaPerKg(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g. 40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rest of India — ₹ per kg</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={weightRestPerKg}
                onChange={(e) => setWeightRestPerKg(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="e.g. 80"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            If no state is sent, the <strong>rest of India</strong> rate applies. Example: 2 kg × ₹40 (Kerala) = ₹80 shipping (after coupon discount).
          </p>
          <div className="pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handleSaveWeightShipping}
              disabled={savingWeightShip}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {savingWeightShip ? 'Saving...' : 'Save shipping settings'}
            </button>
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
                <strong>Note:</strong> Use a <strong>direct MP4/WebM link</strong> (URL ends in .mp4 or .webm). YouTube or page links will not play in the site player. Host files on Cloudinary, S3, or your server. At least one valid URL is required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
