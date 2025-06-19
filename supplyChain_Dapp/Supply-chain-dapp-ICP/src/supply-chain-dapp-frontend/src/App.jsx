import { useState, useEffect } from "react"
import { Actor, HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory, createActor } from "../../declarations/supply-chain-dapp-backend"
import {
  Package,
  RefreshCw,
  LogIn,
  LogOut,
  PlusCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  ChevronDown,
} from "lucide-react"

const canisterId = process.env.SUPPLY_CHAIN_DAPP_BACKEND_CANISTER_ID

// Local development host
const host = "http://localhost:4943"

function App() {
  // State management
  const [authClient, setAuthClient] = useState(null)
  const [identity, setIdentity] = useState(null)
  const [actor, setActor] = useState(null)
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({ name: "", price: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [expandedProduct, setExpandedProduct] = useState(null)

  // Initialize auth client
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const authClient = await AuthClient.create()
        setAuthClient(authClient)

        if (await authClient.isAuthenticated()) {
          await handleAuthenticated(authClient)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        showNotification("Failed to initialize authentication", "error")
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  // Fetch products when actor changes
  useEffect(() => {
    if (actor) {
      fetchProducts(actor)
    }
  }, [actor])

  // Load products on initial mount (even if not logged in)
  useEffect(() => {
    fetchProducts(null)
  }, [])

  const handleAuthenticated = async (authClient) => {
    try {
      const identity = await authClient.getIdentity()
      setIdentity(identity)

      const agent = new HttpAgent({ identity, host })

      // Fetch root key (only needed in local dev)
      await agent.fetchRootKey()

      const actor = createActor(canisterId, { agent })
      setActor(actor)

      console.log("✅ Actor created successfully:", actor)
      showNotification("Successfully authenticated", "success")
      fetchProducts(actor)
    } catch (error) {
      console.error("Error during authentication:", error)
      showNotification("Authentication failed", "error")
    }
  }

  const createAnonymousActor = async () => {
    try {
      const agent = new HttpAgent({ host })

      await agent.fetchRootKey()

      const actor = Actor.createActor(idlFactory, { agent, canisterId })

      console.log("✅ Anonymous actor created:", actor)

      return actor
    } catch (error) {
      console.error("Error creating anonymous actor:", error)
      showNotification("Failed to connect to the backend", "error")
      return null
    }
  }

  const login = async () => {
    if (!authClient) return

    try {
      authClient.login({
        identityProvider:
          process.env.NODE_ENV !== "production"
            ? `${host}?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai#authorize`
            : "https://identity.ic0.app",
        onSuccess: () => handleAuthenticated(authClient),
      })
    } catch (error) {
      console.error("Login error:", error)
      showNotification("Login failed", "error")
    }
  }

  const logout = async () => {
    if (!authClient) return

    try {
      setIsLoading(true)
      await authClient.logout()
      setIdentity(null)
      setActor(null)
      showNotification("Successfully logged out", "info")
    } catch (error) {
      console.error("Logout error:", error)
      showNotification("Logout failed", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async (actorToUse = actor) => {
    setIsFetching(true)
    try {
      const actualActor = actorToUse || (await createAnonymousActor())

      if (!actualActor) {
        throw new Error("No actor available")
      }

      console.log("🚀 Fetching products using actor:", actualActor)

      const allProducts = await actualActor.getAllProducts()

      console.log("✅ Products fetched from backend:", allProducts)

      setProducts(
        allProducts.map((product) => ({
          id: Number(product.id),
          name: product.name,
          price: Number(product.price) / 100000000,
          owner: product.owner,
          status: Number(product.status),
        })),
      )

      if (isFetching) {
        showNotification("Products refreshed successfully", "success")
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error)
      showNotification("Failed to fetch products", "error")
    } finally {
      setIsFetching(false)
    }
  }

  const addProduct = async () => {
    if (!actor || !newProduct.name || !newProduct.price) return

    setIsAdding(true)
    try {
      const priceE8s = Math.floor(Number.parseFloat(newProduct.price) * 100000000)
      await actor.addProduct(newProduct.name, priceE8s)

      console.log("Product added successfully!")
      showNotification(`Product "${newProduct.name}" added successfully`, "success")

      // Wait before fetching to ensure backend updates
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await fetchProducts(actor)

      setNewProduct({ name: "", price: "" })
    } catch (error) {
      console.error("Error adding product:", error)
      showNotification("Failed to add product", "error")
    } finally {
      setIsAdding(false)
    }
  }

  const updateStatus = async (productId, newStatus) => {
    if (!actor) {
      showNotification("Please login to update product status", "info")
      return
    }

    try {
      const statusInt = Number.parseInt(newStatus)
      await actor.updateProductStatus(productId, statusInt)
      console.log(`Updated product ${productId} to status ${newStatus}`)

      // Update local state immediately for better UX
      setProducts(products.map((product) => (product.id === productId ? { ...product, status: statusInt } : product)))

      const statusText = ["Available", "Canceled", "Returned"][statusInt]
      showNotification(`Product status updated to ${statusText}`, "success")

      // Refresh from backend to ensure consistency
      fetchProducts(actor)
    } catch (error) {
      console.error("Error updating product status:", error)
      showNotification("Failed to update product status", "error")
    }
  }

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000)
  }

  // Status configuration for styling
  const statusConfig = {
    0: {
      label: "Available",
      icon: <CheckCircle className="w-4 h-4" />,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
    },
    1: {
      label: "Canceled",
      icon: <XCircle className="w-4 h-4" />,
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
    },
    2: {
      label: "Returned",
      icon: <RotateCcw className="w-4 h-4" />,
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      borderColor: "border-amber-200",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 animate-fade-in-down ${
            notification.type === "success"
              ? "bg-green-100 border-l-4 border-green-500 text-green-800"
              : notification.type === "error"
                ? "bg-red-100 border-l-4 border-red-500 text-red-800"
                : "bg-blue-100 border-l-4 border-blue-500 text-blue-800"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.type === "info" && <RefreshCw className="w-5 h-5 mr-2" />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 animate-fade-in-down">
          <div className="flex items-center mb-2">
            <div className="bg-blue-600 rounded-full p-2 mr-3 animate-pulse">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Supply Chain DApp
            </h1>
            <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">ICP</span>
          </div>
          <p className="text-gray-600 text-center max-w-md">
            Securely manage your supply chain on the Internet Computer
          </p>
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl animate-fade-in">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <LogIn className="w-5 h-5 mr-2" />
              Authentication
            </h2>
          </div>
          <div className="p-6">
            {!identity ? (
              <button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg w-full flex items-center justify-center font-medium transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={login}
                disabled={isLoading || !authClient}
              >
                {isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
                Login with Internet Identity
              </button>
            ) : (
              <div className="text-center animate-fade-in">
                <p className="text-lg mb-3">
                  Logged in as:{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{identity.getPrincipal().toText()}</span>
                </p>
                <button
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg flex items-center justify-center mx-auto transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-70"
                  onClick={logout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Product
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  placeholder="Enter product name"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  disabled={!identity || isAdding}
                />
              </div>

              <div className="relative">
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ICP)
                </label>
                <input
                  id="productPrice"
                  type="number"
                  placeholder="Enter price in ICP"
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  disabled={!identity || isAdding}
                />
              </div>

              <button
                className={`w-full p-3 rounded-lg flex items-center justify-center font-medium transition-all duration-300 ${
                  !identity
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                }`}
                onClick={addProduct}
                disabled={!identity || isAdding || !newProduct.name || !newProduct.price}
              >
                {isAdding ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5 mr-2" />
                )}
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="w-6 h-6 mr-2 text-indigo-600" />
              Product List
            </h2>
            <button
              className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-50 hover:shadow disabled:opacity-70"
              onClick={() => fetchProducts(actor || null)}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Products
            </button>
          </div>

          {isFetching && products.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-gray-500">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No products available yet</p>
              {identity && <p className="text-gray-400 text-sm mt-2">Add your first product using the form above</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-xl ${
                    expandedProduct === product.id ? "ring-2 ring-indigo-500" : ""
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fade-in-up 0.5s ease-out forwards",
                  }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                        ID: {product.id}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-700">
                        <span className="font-bold text-xl text-indigo-600">{product.price.toFixed(8)}</span>
                        <span className="ml-1 text-gray-500">ICP</span>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm">
                        <span className="text-xs mr-1">Owner:</span>
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs truncate max-w-[150px]">
                          {product.owner}
                        </span>
                      </div>

                      <div
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusConfig[product.status].bgColor
                        } ${statusConfig[product.status].textColor} border ${statusConfig[product.status].borderColor}`}
                      >
                        {statusConfig[product.status].icon}
                        <span className="ml-1">{statusConfig[product.status].label}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <label
                        htmlFor={`status-${product.id}`}
                        className="block text-xs font-medium text-gray-500 mb-1.5"
                      >
                        Update Status:
                      </label>
                      <div className="relative">
                        <select
                          id={`status-${product.id}`}
                          className="w-full appearance-none border border-gray-300 p-2 rounded-lg pl-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                          value={product.status}
                          onChange={(e) => updateStatus(product.id, e.target.value)}
                          disabled={!identity}
                        >
                          <option value={0}>Available</option>
                          <option value={1}>Canceled</option>
                          <option value={2}>Returned</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      {!identity && <p className="text-xs text-gray-500 mt-1 italic">Login to update status</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

