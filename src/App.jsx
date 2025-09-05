import React from "react";
import "./App.css";

import { useState, useEffect } from "react";
import { Button } from "./components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/Card";
import { Badge } from "./components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/Tabs";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  {
    id: 1,
    name: "Vada Pao",
    price: 25,
    description: "Mumbai's favorite street food with spicy potato filling",
    image: "/vada-pao-mumbai-street-food.jpg",
    stock: 15,
    category: "snacks",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Filter Coffee",
    price: 30,
    description: "Authentic South Indian filter coffee with perfect blend",
    image: "/south-indian-filter-coffee.jpg",
    stock: 20,
    category: "beverages",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Rajma Rice",
    price: 80,
    description: "Hearty kidney bean curry served with steamed basmati rice",
    image: "/rajma-rice-indian-curry.jpg",
    stock: 12,
    category: "meals",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Masala Dosa",
    price: 60,
    description: "Crispy crepe filled with spiced potato mixture",
    image: "/masala-dosa-south-indian.png",
    stock: 8,
    category: "meals",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Chai",
    price: 15,
    description: "Traditional Indian spiced tea",
    image: "/indian-chai-tea.jpg",
    stock: 25,
    category: "beverages",
    rating: 4.4,
  },
];

export default function CanteenOrderingSystem() {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("menu");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [menu, setMenu] = useState(menuItems);

  // Timer for checkout countdown
  useEffect(() => {
    let interval;
    if (currentOrder && currentOrder.expiresAt) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = currentOrder.expiresAt.getTime();
        const difference = expiry - now;

        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          handleOrderExpiry(currentOrder);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentOrder]);
  const addToCart = (item) => {
    if (item.stock === 0) return;

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        // ✅ check stock before adding
        if (existing.quantity >= item.stock) {
          return prev; // don't add more than stock
        }
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) return;

    const newOrder = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total: getCartTotal(),
      status: "pending",
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };

    setCurrentOrder(newOrder);
    setActiveTab("checkout");
  };

  const handlePaymentSuccess = () => {
    if (!currentOrder) return;

    setMenu((prev) =>
      prev.map((item) => {
        const cartItem = currentOrder.items.find((ci) => ci.id === item.id);
        if (cartItem) {
          return { ...item, stock: item.stock - cartItem.quantity };
        }
        return item;
      })
    );

    const completedOrder = { ...currentOrder, status: "completed" };
    setOrders((prev) => [...prev, completedOrder]);

    setCart([]);
    setCurrentOrder(null);
    setActiveTab("orders");
  };

  const handleOrderExpiry = (order) => {
    const expiredOrder = { ...order, status: "expired" };
    setOrders((prev) => [...prev, expiredOrder]);
    setCurrentOrder(null);
    setCart([]);
    setActiveTab("menu");
  };

  const cancelOrder = () => {
    if (!currentOrder) return;

    const cancelledOrder = { ...currentOrder, status: "cancelled" };
    setOrders((prev) => [...prev, cancelledOrder]);
    setCurrentOrder(null);
    setCart([]);
    setActiveTab("menu");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-700 border-green-500/30",
      cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
      expired: "bg-gray-500/20 text-gray-700 border-gray-500/30",
    };

    return (
      <Badge className={`${variants[status]} animate-glow`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-strong sticky top-0 z-50 p-4 border-b border-border/30"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-4xl">🍽️</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Flashy Canteen
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Order • Pay • Enjoy
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="glass relative overflow-hidden bg-card/90 text-card-foreground border-border/50 hover:bg-card hover:text-card-foreground hover:border-primary/50 transition-all duration-300"
                onClick={() => setActiveTab("cart")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </Button>
              {cart.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-xs text-white font-bold animate-glow"
                >
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="glass-strong grid w-full grid-cols-4 bg-card/90 p-1">
            <TabsTrigger
              value="menu"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-foreground hover:text-foreground/80 data-[state=inactive]:text-foreground font-medium transition-all duration-300 rounded-md"
            >
              Menu
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-foreground hover:text-foreground/80 data-[state=inactive]:text-foreground font-medium transition-all duration-300 rounded-md"
            >
              Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </TabsTrigger>
            <TabsTrigger
              value="checkout"
              disabled={!currentOrder}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-foreground hover:text-foreground/80 disabled:text-muted-foreground data-[state=inactive]:text-foreground font-medium transition-all duration-300 rounded-md"
            >
              Checkout
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white text-foreground hover:text-foreground/80 data-[state=inactive]:text-foreground font-medium transition-all duration-300 rounded-md"
            >
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 mb-8"
            >
              <h2 className="text-2xl font-bold text-foreground">Our Menu</h2>
              <p className="text-muted-foreground">
                Fresh, delicious food made with love
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {menu.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="animate-float"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Fixed card text visibility with proper background and text colors */}
                    <Card className="glass overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-card/90 text-card-foreground">
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className="bg-primary/90 text-primary-foreground">
                            ₹{item.price}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-secondary/90 text-secondary-foreground"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {item.rating}
                          </Badge>
                        </div>
                        {item.stock <= 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge
                              variant="destructive"
                              className="text-lg px-4 py-2"
                            >
                              Out of Stock
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        {/* Ensured card title and description have proper text colors */}
                        <CardTitle className="text-xl text-card-foreground">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Stock: {item?.stock}
                        </div>
                        <motion.div whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => addToCart(item)}
                            disabled={item.quantity >= item.stock}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-300 border-0"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 mb-6"
            >
              <h2 className="text-2xl font-bold text-foreground">Your Cart</h2>
              <p className="text-muted-foreground">
                Review your items before checkout
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {cart.length === 0 ? (
                <Card className="glass text-center p-8 bg-card/90 text-card-foreground border-border/50">
                  <CardContent>
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                      Your cart is empty
                    </h3>
                    <p className="text-muted-foreground">
                      Add some delicious items from our menu!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        layout
                      >
                        {/* Fixed cart item text visibility */}
                        <Card className="glass bg-card/90 text-card-foreground">
                          <CardContent className="flex items-center gap-4 p-4">
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-card-foreground">
                                {item.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                ₹{item.price} each
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 p-0 bg-card/50 text-card-foreground border-border hover:bg-card hover:text-card-foreground"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold text-card-foreground">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 p-0 bg-card/50 text-card-foreground border-border hover:bg-card hover:text-card-foreground"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-card-foreground">
                                ₹{item.price * item.quantity}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Fixed total card text visibility */}
                  <Card className="glass-strong bg-card/95 text-card-foreground">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between text-xl font-bold mb-4">
                        <span className="text-card-foreground">Total:</span>
                        <span className="gradient-primary bg-clip-text text-transparent">
                          ₹{getCartTotal()}
                        </span>
                      </div>
                      <motion.div whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={proceedToCheckout}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 hover:shadow-xl transition-all duration-300 border-0"
                        >
                          Proceed to Checkout
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          </TabsContent>

          {/* Checkout Tab */}
          <TabsContent value="checkout" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 mb-6"
            >
              <h2 className="text-2xl font-bold text-foreground">Checkout</h2>
              <p className="text-muted-foreground">
                Complete your order securely
              </p>
            </motion.div>

            {currentOrder && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Fixed checkout card text visibility */}
                <Card className="glass-strong border-primary/50 animate-glow bg-card/95 text-card-foreground">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Clock className="w-5 h-5 text-primary" />
                      Order Confirmation - {currentOrder.id}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Complete your payment within:
                      <span className="font-bold text-primary ml-2 text-lg">
                        {formatTime(timeLeft)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-card-foreground"
                      >
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-card-foreground">Total:</span>
                        <span className="gradient-primary bg-clip-text text-transparent">
                          ₹{currentOrder.total}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-4">
                    <motion.div whileTap={{ scale: 0.98 }} className="flex-1">
                      <Button
                        onClick={handlePaymentSuccess}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 hover:shadow-xl transition-all duration-300 border-0"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Complete Payment
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={cancelOrder}
                        className="px-6 py-6 bg-card/50 text-card-foreground border-border hover:bg-card hover:text-card-foreground"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2 mb-6"
            >
              <h2 className="text-2xl font-bold text-foreground">
                Order History
              </h2>
              <p className="text-muted-foreground">
                Track your past orders and status
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {orders.length === 0 ? (
                <Card className="glass text-center p-8 bg-card/90 text-card-foreground border-border/50">
                  <CardContent>
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                      No orders yet
                    </h3>
                    <p className="text-muted-foreground">
                      Your order history will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Fixed order history card text visibility */}
                      <Card className="glass bg-card/90 text-card-foreground">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-card-foreground">
                              {order.id}
                            </CardTitle>
                            {getStatusBadge(order.status)}
                          </div>
                          <CardDescription className="text-muted-foreground">
                            {order.timestamp.toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm text-card-foreground"
                              >
                                <span>
                                  {item.name} x {item.quantity}
                                </span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span className="text-card-foreground">
                                Total:
                              </span>
                              <span className="gradient-primary bg-clip-text text-transparent">
                                ₹{order.total}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
