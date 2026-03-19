import { useEffect, useState } from 'react'
import api from '../../services/api'

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    expiresAt: '',
    isActive: true
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/coupons')
      setCoupons(res.data || [])
    } catch (err) {
      console.error('Error loading coupons', err)
      alert('Error loading coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      type: 'percent',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      expiresAt: '',
      isActive: true
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (!formData.code.trim() || !formData.value) {
      alert('Please enter coupon code and value')
      return
    }
    try {
      setSaving(true)
      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        expiresAt: formData.expiresAt || undefined,
        isActive: formData.isActive
      }

      let res
      if (editingCoupon) {
        res = await api.put(`/admin/coupons/${editingCoupon._id}`, payload)
      } else {
        res = await api.post('/admin/coupons', payload)
      }

      if (res.data) {
        await fetchCoupons()
        resetForm()
        alert('Coupon saved successfully')
      }
    } catch (err) {
      console.error('Error saving coupon', err)
      const message = err.response?.data?.message || err.message || 'Error saving coupon'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value?.toString() || '',
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 10) : '',
      isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : true
    })
  }

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return
    try {
      await api.delete(`/admin/coupons/${coupon._id}`)
      await fetchCoupons()
    } catch (err) {
      console.error('Error deleting coupon', err)
      alert('Error deleting coupon')
    }
  }

  const toggleActive = async (coupon) => {
    try {
      const res = await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      if (res.data) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: res.data.isActive } : c))
        )
      }
    } catch (err) {
      console.error('Error updating coupon status', err)
      alert('Error updating coupon status')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Existing coupons</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-6 text-sm text-gray-500">Loading coupons…</div>
                ) : coupons.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500">No coupons created yet.</div>
                ) : (
                  coupons.map((coupon) => (
                    <div key={coupon._id} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{coupon.code}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {coupon.type === 'percent' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                          </span>
                          {!coupon.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 space-x-2">
                          {coupon.minOrderAmount > 0 && (
                            <span>Min order: ₹{coupon.minOrderAmount}</span>
                          )}
                          {coupon.maxDiscountAmount && (
                            <span>Max discount: ₹{coupon.maxDiscountAmount}</span>
                          )}
                          {coupon.expiresAt && (
                            <span>
                              Expires:{' '}
                              {new Date(coupon.expiresAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(coupon)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            coupon.isActive
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(coupon)}
                          className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon)}
                          className="px-3 py-1 rounded-full text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">
                  {editingCoupon ? 'Edit coupon' : 'Add new coupon'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="E.g. SAVE10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    >
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder={formData.type === 'percent' ? 'e.g. 10' : 'e.g. 100'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min order amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max discount amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Optional cap for percent coupons"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry date</label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive === true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className="text-xs font-medium text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : editingCoupon ? 'Update coupon' : 'Create coupon'}
                  </button>
                  {editingCoupon && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCoupons

