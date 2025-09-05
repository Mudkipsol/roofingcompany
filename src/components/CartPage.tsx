'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2, Plus, Minus, Calendar as CalendarIcon, MapPin, Truck, Settings, Store } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  brand: string
  price: number
  quantity: number
  unit: string
}

interface DeliveryInfo {
  date: Date | undefined
  address: string
  city: string
  state: string
  zipCode: string
  contactName: string
  contactPhone: string
  notes: string
}

interface WillCallInfo {
  pickupDate: Date | undefined
  branchLocation: string
  contactName: string
  contactPhone: string
  notes: string
}

interface DeskOrderInfo {
  requestedItems: DeskOrderItem[]
  customerSpecs: string
  projectDetails: string
  estimatedBudget: number
  needByDate: Date | undefined
  contactName: string
  contactPhone: string
  projectAddress: string
  notes: string
}

interface DeskOrderItem {
  id: string
  description: string
  quantity: number
  estimatedPrice: number
  manufacturer: string
  model: string
  notes: string
}

interface CounterOrderInfo {
  paymentMethod: 'cash' | 'account' | 'credit'
  customerName: string
  accountNumber?: string
  contactPhone: string
  immediatePickup: boolean
  notes: string
}

type OrderType = 'delivery' | 'willcall' | 'desk' | 'counter'

// MBS Branch Locations for Will Call pickup
const MBS_BRANCHES = [
  { id: 'akron', name: 'Akron, OH', address: '1234 Main St, Akron, OH 44301' },
  { id: 'canton', name: 'Canton, OH', address: '5678 State St, Canton, OH 44702' },
  { id: 'cleveland', name: 'Cleveland, OH', address: '9012 Superior Ave, Cleveland, OH 44113' },
  { id: 'columbus', name: 'Columbus, OH', address: '3456 Broad St, Columbus, OH 43215' },
  { id: 'dayton', name: 'Dayton, OH', address: '7890 Third St, Dayton, OH 45402' },
  { id: 'toledo', name: 'Toledo, OH', address: '2345 Monroe St, Toledo, OH 43604' },
  { id: 'youngstown', name: 'Youngstown, OH', address: '6789 Market St, Youngstown, OH 44503' }
]

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart, clearCart } = useCart()

  const [orderType, setOrderType] = useState<OrderType>('delivery')
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    date: undefined,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactName: '',
    contactPhone: '',
    notes: ''
  })

  const [willCallInfo, setWillCallInfo] = useState<WillCallInfo>({
    pickupDate: undefined,
    branchLocation: '',
    contactName: '',
    contactPhone: '',
    notes: ''
  })

  const [deskOrderInfo, setDeskOrderInfo] = useState<DeskOrderInfo>({
    requestedItems: [],
    customerSpecs: '',
    projectDetails: '',
    estimatedBudget: 0,
    needByDate: undefined,
    contactName: '',
    contactPhone: '',
    projectAddress: '',
    notes: ''
  })

  const [counterOrderInfo, setCounterOrderInfo] = useState<CounterOrderInfo>({
    paymentMethod: 'cash',
    customerName: '',
    accountNumber: '',
    contactPhone: '',
    immediatePickup: true,
    notes: ''
  })

  const [showDeliveryScheduling, setShowDeliveryScheduling] = useState(false)
  const [quantityInputs, setQuantityInputs] = useState<{[key: string]: string}>({})

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const deliveryFee = orderType === 'delivery' ? 75.00 : 0.00 // No delivery fee for will call, desk, or counter orders
  const total = subtotal + tax + deliveryFee

  const handleSubmitOrder = () => {
    const orderData = {
      orderType,
      cartItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      orderDate: new Date().toISOString(),
      status: orderType === 'willcall' ? 'preparing' :
              orderType === 'desk' ? 'quote-requested' :
              orderType === 'counter' ? (counterOrderInfo.immediatePickup ? 'completed' : 'ready') :
              'pending',
      ...(orderType === 'delivery' ? { deliveryInfo } :
          orderType === 'willcall' ? { willCallInfo } :
          orderType === 'desk' ? { deskOrderInfo } :
          { counterOrderInfo })
    }

    // Save order to localStorage (in real app, this would be an API call)
    const existingOrders = JSON.parse(localStorage.getItem('mbs-orders') || '[]')
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ...orderData
    }
    existingOrders.push(newOrder)
    localStorage.setItem('mbs-orders', JSON.stringify(existingOrders))

    console.log('Order submitted:', newOrder)
    const orderMessage =
      orderType === 'willcall' ? 'Will Call order submitted successfully! You will receive a confirmation email shortly.' :
      orderType === 'desk' ? 'Special order request submitted! Our team will review your specifications and provide a quote within 24-48 hours.' :
      orderType === 'counter' ? (counterOrderInfo.immediatePickup ? 'Counter sale completed! Thank you for your purchase.' : 'Counter order submitted! Items are being prepared for pickup.') :
      'Delivery order submitted successfully! You will receive a confirmation email shortly.';

    alert(orderMessage)
    if (orderType !== 'desk') {
      clearCart() // Don't clear cart for desk orders since they're quote requests
    }
    setShowDeliveryScheduling(false)

    // Reset forms
    setDeliveryInfo({
      date: undefined, address: '', city: '', state: '', zipCode: '', contactName: '', contactPhone: '', notes: ''
    })
    setWillCallInfo({
      pickupDate: undefined, branchLocation: '', contactName: '', contactPhone: '', notes: ''
    })
    setDeskOrderInfo({
      requestedItems: [], customerSpecs: '', projectDetails: '', estimatedBudget: 0,
      needByDate: undefined, contactName: '', contactPhone: '', projectAddress: '', notes: ''
    })
    setCounterOrderInfo({
      paymentMethod: 'cash', customerName: '', accountNumber: '', contactPhone: '',
      immediatePickup: true, notes: ''
    })
  }

  const handleQuantityInputChange = (itemId: string, value: string) => {
    setQuantityInputs(prev => ({ ...prev, [itemId]: value }))
  }

  const handleQuantityInputSubmit = (itemId: string) => {
    const newQuantity = parseInt(quantityInputs[itemId])
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
    }
    // Clear the input state for this item
    setQuantityInputs(prev => {
      const newState = { ...prev }
      delete newState[itemId]
      return newState
    })
  }

  const isDeliveryInfoComplete =
    deliveryInfo.date &&
    deliveryInfo.address &&
    deliveryInfo.city &&
    deliveryInfo.state &&
    deliveryInfo.zipCode &&
    deliveryInfo.contactName &&
    deliveryInfo.contactPhone

  const isWillCallInfoComplete =
    willCallInfo.pickupDate &&
    willCallInfo.branchLocation &&
    willCallInfo.contactName &&
    willCallInfo.contactPhone

  const isDeskOrderInfoComplete =
    deskOrderInfo.projectDetails &&
    deskOrderInfo.customerSpecs &&
    deskOrderInfo.needByDate &&
    deskOrderInfo.contactName &&
    deskOrderInfo.contactPhone

  const isCounterOrderInfoComplete =
    counterOrderInfo.customerName &&
    counterOrderInfo.contactPhone &&
    (counterOrderInfo.paymentMethod !== 'account' || counterOrderInfo.accountNumber)

  const isOrderInfoComplete =
    orderType === 'delivery' ? isDeliveryInfoComplete :
    orderType === 'willcall' ? isWillCallInfoComplete :
    orderType === 'desk' ? isDeskOrderInfoComplete :
    orderType === 'counter' ? isCounterOrderInfoComplete : false

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3" />
            Shopping Cart
          </h1>
          <p className="text-gray-600 mt-2">Review your order and schedule delivery</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <Button className="mbs-red mbs-red-hover" asChild>
                <Link href="/inventory">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <Input
                            type="number"
                            min="1"
                            value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                            onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                            onBlur={() => handleQuantityInputSubmit(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleQuantityInputSubmit(item.id)
                              }
                            }}
                            className="w-16 text-center h-8"
                          />

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Order Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          orderType === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setOrderType('delivery')}
                      >
                        <div className="flex items-center space-x-3">
                          <Truck className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">Delivery</h3>
                            <p className="text-sm text-gray-600">We'll deliver to your job site</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          orderType === 'willcall' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setOrderType('willcall')}
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-6 h-6 text-green-600" />
                          <div>
                            <h3 className="font-semibold">Will Call (Pickup)</h3>
                            <p className="text-sm text-gray-600">Pick up at MBS branch location</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          orderType === 'desk' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setOrderType('desk')}
                      >
                        <div className="flex items-center space-x-3">
                          <Settings className="w-6 h-6 text-purple-600" />
                          <div>
                            <h3 className="font-semibold">Desk Order (Special)</h3>
                            <p className="text-sm text-gray-600">Custom items not in stock</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          orderType === 'counter' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setOrderType('counter')}
                      >
                        <div className="flex items-center space-x-3">
                          <Store className="w-6 h-6 text-orange-600" />
                          <div>
                            <h3 className="font-semibold">Counter Sale</h3>
                            <p className="text-sm text-gray-600">Walk-in purchase, immediate pickup</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Scheduling */}
              {showDeliveryScheduling && orderType === 'delivery' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Schedule Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Calendar */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Select Delivery Date</Label>
                      <Calendar
                        mode="single"
                        selected={deliveryInfo.date}
                        onSelect={(date) => setDeliveryInfo(prev => ({ ...prev, date }))}
                        disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                        className="rounded-md border"
                      />
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Delivery Address</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            placeholder="123 Main Street"
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="Youngstown"
                            value={deliveryInfo.city}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="state">State</Label>
                          <Select value={deliveryInfo.state} onValueChange={(value) => setDeliveryInfo(prev => ({ ...prev, state: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OH">Ohio</SelectItem>
                              <SelectItem value="PA">Pennsylvania</SelectItem>
                              <SelectItem value="WV">West Virginia</SelectItem>
                              <SelectItem value="KY">Kentucky</SelectItem>
                              <SelectItem value="IN">Indiana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="44503"
                            value={deliveryInfo.zipCode}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Contact Information</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactName">Contact Name</Label>
                          <Input
                            id="contactName"
                            placeholder="John Smith"
                            value={deliveryInfo.contactName}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, contactName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="contactPhone">Phone Number</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={deliveryInfo.contactPhone}
                            onChange={(e) => setDeliveryInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Notes */}
                    <div>
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special delivery instructions..."
                        value={deliveryInfo.notes}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Will Call Scheduling */}
              {showDeliveryScheduling && orderType === 'willcall' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Schedule Will Call Pickup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Branch Location Selection */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Select Pickup Location</Label>
                      <Select
                        value={willCallInfo.branchLocation}
                        onValueChange={(value) => setWillCallInfo(prev => ({ ...prev, branchLocation: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose MBS branch location" />
                        </SelectTrigger>
                        <SelectContent>
                          {MBS_BRANCHES.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              <div>
                                <div className="font-medium">{branch.name}</div>
                                <div className="text-sm text-gray-500">{branch.address}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pickup Date Calendar */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Select Pickup Date</Label>
                      <Calendar
                        mode="single"
                        selected={willCallInfo.pickupDate}
                        onSelect={(date) => setWillCallInfo(prev => ({ ...prev, pickupDate: date }))}
                        disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                        className="rounded-md border"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Contact Information</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="willcall-contactName">Contact Name</Label>
                          <Input
                            id="willcall-contactName"
                            placeholder="John Smith"
                            value={willCallInfo.contactName}
                            onChange={(e) => setWillCallInfo(prev => ({ ...prev, contactName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="willcall-contactPhone">Phone Number</Label>
                          <Input
                            id="willcall-contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={willCallInfo.contactPhone}
                            onChange={(e) => setWillCallInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pickup Notes */}
                    <div>
                      <Label htmlFor="willcall-notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="willcall-notes"
                        placeholder="Any special pickup instructions..."
                        value={willCallInfo.notes}
                        onChange={(e) => setWillCallInfo(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Selected Branch Info */}
                    {willCallInfo.branchLocation && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Pickup Location Details</h4>
                        {(() => {
                          const selectedBranch = MBS_BRANCHES.find(b => b.id === willCallInfo.branchLocation);
                          return selectedBranch ? (
                            <div className="text-blue-800">
                              <p className="font-medium">{selectedBranch.name}</p>
                              <p className="text-sm">{selectedBranch.address}</p>
                              <p className="text-sm mt-2">
                                <strong>Hours:</strong> Monday-Friday 7:00 AM - 5:00 PM, Saturday 8:00 AM - 12:00 PM
                              </p>
                              <p className="text-sm">
                                <strong>Will Call Hours:</strong> Monday-Friday 7:00 AM - 4:30 PM, Saturday 8:00 AM - 11:30 AM
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Desk Order (Special Order) Form */}
              {showDeliveryScheduling && orderType === 'desk' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Special Order Request
                    </CardTitle>
                    <CardDescription>
                      Request custom items not currently in stock. Our team will source these items from suppliers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Project Information */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Project Information</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="desk-projectDetails">Project Name/Description</Label>
                          <Input
                            id="desk-projectDetails"
                            placeholder="New roof construction - Smith Residence"
                            value={deskOrderInfo.projectDetails}
                            onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, projectDetails: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="desk-estimatedBudget">Estimated Budget</Label>
                          <Input
                            id="desk-estimatedBudget"
                            type="number"
                            placeholder="10000"
                            value={deskOrderInfo.estimatedBudget || ''}
                            onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, estimatedBudget: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="desk-projectAddress">Project Address</Label>
                        <Input
                          id="desk-projectAddress"
                          placeholder="123 Main St, Youngstown, OH 44503"
                          value={deskOrderInfo.projectAddress}
                          onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, projectAddress: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="desk-customerSpecs">Customer Specifications</Label>
                        <Textarea
                          id="desk-customerSpecs"
                          placeholder="Detailed specifications for materials needed..."
                          value={deskOrderInfo.customerSpecs}
                          onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, customerSpecs: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Need By Date */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">When do you need these items?</Label>
                      <Calendar
                        mode="single"
                        selected={deskOrderInfo.needByDate}
                        onSelect={(date) => setDeskOrderInfo(prev => ({ ...prev, needByDate: date }))}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Contact Information</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="desk-contactName">Contact Name</Label>
                          <Input
                            id="desk-contactName"
                            placeholder="John Smith"
                            value={deskOrderInfo.contactName}
                            onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, contactName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="desk-contactPhone">Phone Number</Label>
                          <Input
                            id="desk-contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={deskOrderInfo.contactPhone}
                            onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <Label htmlFor="desk-notes">Additional Notes</Label>
                      <Textarea
                        id="desk-notes"
                        placeholder="Any additional requirements, delivery instructions, or special considerations..."
                        value={deskOrderInfo.notes}
                        onChange={(e) => setDeskOrderInfo(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Special Order Process Info */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Special Order Process</h4>
                      <div className="text-purple-800 text-sm space-y-1">
                        <p><strong>1. Quote Request:</strong> We'll review your specifications and contact suppliers</p>
                        <p><strong>2. Quote Approval:</strong> You'll receive pricing and lead times within 24-48 hours</p>
                        <p><strong>3. Order Placement:</strong> Upon approval, we'll place the order with suppliers</p>
                        <p><strong>4. Delivery/Pickup:</strong> Items arrive according to supplier lead times</p>
                        <p className="mt-2"><strong>Lead Times:</strong> Typically 1-4 weeks depending on manufacturer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Counter Order (Walk-in Sale) Form */}
              {showDeliveryScheduling && orderType === 'counter' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="w-5 h-5 mr-2" />
                      Counter Sale (Walk-in Purchase)
                    </CardTitle>
                    <CardDescription>
                      Immediate purchase for walk-in customers. Items available for immediate pickup.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Payment Method</Label>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            counterOrderInfo.paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCounterOrderInfo(prev => ({ ...prev, paymentMethod: 'cash' }))}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">Cash</h3>
                            <p className="text-sm text-gray-600">Pay with cash</p>
                          </div>
                        </div>

                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            counterOrderInfo.paymentMethod === 'account' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCounterOrderInfo(prev => ({ ...prev, paymentMethod: 'account' }))}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">Account</h3>
                            <p className="text-sm text-gray-600">Charge to account</p>
                          </div>
                        </div>

                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            counterOrderInfo.paymentMethod === 'credit' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCounterOrderInfo(prev => ({ ...prev, paymentMethod: 'credit' }))}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">Credit Card</h3>
                            <p className="text-sm text-gray-600">Pay with card</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Customer Information</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="counter-customerName">Customer Name</Label>
                          <Input
                            id="counter-customerName"
                            placeholder="John Smith"
                            value={counterOrderInfo.customerName}
                            onChange={(e) => setCounterOrderInfo(prev => ({ ...prev, customerName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="counter-contactPhone">Phone Number</Label>
                          <Input
                            id="counter-contactPhone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={counterOrderInfo.contactPhone}
                            onChange={(e) => setCounterOrderInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Account Number for Account Payments */}
                      {counterOrderInfo.paymentMethod === 'account' && (
                        <div>
                          <Label htmlFor="counter-accountNumber">Account Number</Label>
                          <Input
                            id="counter-accountNumber"
                            placeholder="Enter account number"
                            value={counterOrderInfo.accountNumber || ''}
                            onChange={(e) => setCounterOrderInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Pickup Option */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Pickup Method</Label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            counterOrderInfo.immediatePickup ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCounterOrderInfo(prev => ({ ...prev, immediatePickup: true }))}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">Immediate Pickup</h3>
                            <p className="text-sm text-gray-600">Customer takes items now</p>
                          </div>
                        </div>

                        <div
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            !counterOrderInfo.immediatePickup ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setCounterOrderInfo(prev => ({ ...prev, immediatePickup: false }))}
                        >
                          <div className="text-center">
                            <h3 className="font-semibold">Hold for Pickup</h3>
                            <p className="text-sm text-gray-600">Hold items for later</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="counter-notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="counter-notes"
                        placeholder="Any special instructions or notes..."
                        value={counterOrderInfo.notes}
                        onChange={(e) => setCounterOrderInfo(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    {/* Counter Sale Process Info */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Counter Sale Process</h4>
                      <div className="text-orange-800 text-sm space-y-1">
                        <p><strong>1. Payment Processing:</strong> Payment will be processed at the counter</p>
                        <p><strong>2. Receipt:</strong> You'll receive a printed receipt and order summary</p>
                        <p><strong>3. Item Pickup:</strong> {counterOrderInfo.immediatePickup ? 'Items ready for immediate pickup' : 'Items will be held for pickup'}</p>
                        <p><strong>4. Loading Assistance:</strong> Our team can help load items to your vehicle</p>
                        <p className="mt-2"><strong>Store Hours:</strong> Monday-Friday 7:00 AM - 5:00 PM, Saturday 8:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{orderType === 'delivery' ? 'Delivery Fee:' :
                             orderType === 'willcall' ? 'Pickup Fee:' :
                             orderType === 'counter' ? 'Processing Fee:' : 'Service Fee:'}</span>
                      <span>
                        {orderType === 'delivery' ? `${deliveryFee.toFixed(2)}` : 'FREE'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>
                        {orderType === 'desk' ? (
                          <span className="text-purple-600">Quote Pending</span>
                        ) : (
                          `${total.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!showDeliveryScheduling ? (
                      <Button
                        onClick={() => setShowDeliveryScheduling(true)}
                        className="w-full mbs-red mbs-red-hover"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {orderType === 'delivery' ? 'Schedule Delivery' :
                         orderType === 'willcall' ? 'Schedule Pickup' :
                         orderType === 'desk' ? 'Submit Special Order Request' :
                         'Process Counter Sale'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={!isOrderInfoComplete}
                        className="w-full mbs-red mbs-red-hover"
                      >
                        {orderType === 'delivery' ? (
                          <>
                            <Truck className="w-4 h-4 mr-2" />
                            Confirm Delivery Order
                          </>
                        ) : orderType === 'willcall' ? (
                          <>
                            <MapPin className="w-4 h-4 mr-2" />
                            Confirm Will Call Order
                          </>
                        ) : orderType === 'desk' ? (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Request Quote
                          </>
                        ) : (
                          <>
                            <Store className="w-4 h-4 mr-2" />
                            Complete Counter Sale
                          </>
                        )}
                      </Button>
                    )}

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/inventory">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Order Status */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          Delivery Area
                        </Badge>
                        <span className="text-sm text-gray-600">5-State Region</span>
                      </div>

                      {deliveryInfo.date && (
                        <div className="flex items-center">
                          <Badge className="mr-2 bg-green-500">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            Scheduled
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {deliveryInfo.date.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  )
}
