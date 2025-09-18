import DropdownField from "@/components/DropdownField";
import OrderCartIcon from "../icons/OrderCartIcon";
import EmptyOrderIllustration from "../illustrations/EmptyOrder";
import { AnimatePresence, motion } from "motion/react";
import SafeImage from "@/components/SafeImage";
import LogoIcon from "../icons/LogoIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import MinusIcon from "../icons/MinusIcon";
import DiscountDropdown from "./DiscountDropdown";
import { formatCurrency } from "@/utils/currency";
import { Discount } from "@/services/discountService";
import { User } from "firebase/auth";
import { Category } from "@/services/categoryService";

interface RightSidePanelProps {
    setOrderType: (type: 'DINE-IN' | 'TAKE OUT' | 'DELIVERY') => void;
    setShowSuccessToast: (show: boolean) => void;
    setSuccessOrderId: (id: string) => void;
    setShowOrderConfirmation: (show: boolean) => void;
    cart: Array<{
        id: string;
        name: string;
        price: number;
        cost?: number;
        quantity: number;
        originalStock: number;
        imgUrl?: string | null;
        categoryId: number | string;
    }>;
    setCart: React.Dispatch<React.SetStateAction<Array<{
        id: string;
        name: string;
        price: number;
        cost?: number;
        quantity: number;
        originalStock: number;
        imgUrl?: string | null;
        categoryId: number | string;
    }>>>;
    getAvailableStock: (id: string) => number;
        createOrder: (
            items: Array<{
            id: string;
            name: string;
            price: number;
            cost: number;
            quantity: number;
            imgUrl: string;
            categoryId: string | number;
            originalStock: number;
            }>,
            total: number,
            subtotal: number,
            cashierName: string,
            cashierId: string,
            orderType: 'DINE-IN' | 'TAKE OUT' | 'DELIVERY',
            discountAmount: number,
            discountCode: string
        ) => Promise<string>;
    user: User | null;
    orderType: 'DINE-IN' | 'TAKE OUT' | 'DELIVERY',
    categories: Category[];
    discountAmount: number;
    setDiscountAmount: React.Dispatch<React.SetStateAction<number>>;
    discountCode: string;
    setDiscountCode: React.Dispatch<React.SetStateAction<string>>;
    appliedDiscount: Discount | null;
    setAppliedDiscount: React.Dispatch<React.SetStateAction<Discount | null>>;
    isPlacingOrder: boolean;
    setIsPlacingOrder: React.Dispatch<React.SetStateAction<boolean>>;
    subtotal: number;
    total: number;
    clearCart: () => void;
}

export default function RightSidePanel({ 
    setOrderType, 
    setShowOrderConfirmation,
    cart,
    setCart,
    getAvailableStock,
    user,
    categories,
    discountAmount,
    setDiscountAmount,
    discountCode,
    setDiscountCode,
    setAppliedDiscount,
    isPlacingOrder,
    subtotal,
    total,
    clearCart,
}: RightSidePanelProps) {
    // Get unique category IDs from cart items
    const getCartCategoryIds = (): string[] => {
        const categoryIds = cart.map(item => String(item.categoryId));
        return [...new Set(categoryIds)]; // Remove duplicates
    };
    
    // Handle discount application
    const handleDiscountApplied = (discount: Discount | null, amount: number) => {
        setAppliedDiscount(discount);
        setDiscountAmount(amount);
        if (discount) {
            console.log('Discount applied:', discount.discount_code, 'Amount:', amount);
        } else {
            console.log('Discount cleared');
        }
    };
    
    const updateQuantity = (id: string, delta: number) => {
        console.log(`Updating quantity for item ${id} by ${delta}`);
        setCart(
            cart.map((item) => {
                    if (item.id === id) {
                        const newQuantity = Math.max(0, item.quantity + delta);
                        // Check if we can increase quantity based on available stock
                        if (delta > 0) {
                            const availableStock = getAvailableStock(id);
                            if (availableStock <= 0) {
                                return item; // Don't increase if no available stock
                            }
                        }
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    // Function to handle placing order
    const handlePlaceOrder = () => {
        if (cart.length === 0 || !user) return;
        setShowOrderConfirmation(true);
    };
    
    return (
        <div className="flex-col h-full shadow-lg bg-[var(--primary)] overflow-hidden flex-shrink-0 hidden lg:flex">
                {/* Header Section - Fixed at top (154px total) */}
                <div className="flex-shrink-0">
                    <div className="w-full h-[60px] bg-[var(--primary)] border-b border-[var(--secondary)]/20 border-dashed">
                        {/* Order Header */}
                        <div className="flex items-center gap-3 p-3">
                            <div className="bg-[var(--light-accent)] w-10 h-10 rounded-full items-center justify-center flex relative">
                                <OrderCartIcon className="size-4 text-[var(--secondary)]"/>
                                {cart.length > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col items-center">
                                <span className="text-[var(--secondary)] font-medium text-[12px] self-start">
                                    {cart.length === 0 ? 'New Order' : 'Current Order'}
                                </span>
                                <span className="text-[var(--secondary)] font-light text-[10px] self-start">
                                    {cart.length === 0 ? 'No items added' : `${cart.length} item${cart.length !== 1 ? 's' : ''}`}
                                </span>
                            </div>
                            {cart.length > 0 && (
                                <button 
                                    onClick={clearCart}
                                    className="text-[var(--error)] border-1 border-[var(--error)] hover:text-white text-xs font-medium hover:bg-[var(--error)]/50 px-2 py-1 rounded transition-all"
                                    title="Clear all items"
                                >
                                    Clear
                                </button>
                            )}
                            <div className="hidden bg-[var(--light-accent)] w-16 h-16 rounded-full"></div>
                        </div>
                    </div>

                    <div className="h-16 p-3">
                        <div className="flex h-[42px] items-center justify-between bg-[var(--background)] rounded-[24px] gap-3">
                            <DropdownField
                                options={["DINE-IN", "TAKE OUT", "DELIVERY"]}
                                defaultValue="TAKE OUT"
                                dropdownPosition="bottom-right"
                                dropdownOffset={{ top: 2, right: 0 }}
                                onChange={(value) => setOrderType(value as 'DINE-IN' | 'TAKE OUT' | 'DELIVERY')}
                                roundness={"full"}
                                height={42}
                                valueAlignment={'left'}
                                padding=""
                                shadow={false}
                                fontSize="12px"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Cart Items - Scrollable middle section */}
                <div className="flex-1 overflow-y-auto px-6 p-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="w-[150px] h-[120px] flex items-center justify-center mb-4 opacity-40">
                                <EmptyOrderIllustration />
                            </div>
                            <h3 className="text-[14px] font-medium text-[var(--secondary)] mb-2 select-none">
                                Order List is Empty
                            </h3>
                            <p className="text-[var(--secondary)] w-[240px] opacity-70 text-center max-w-sm text-[12px] leading-relaxed select-none">
                                Add items from the menu to start building your order. Click on any menu item to add it to your cart.
                            </p>
                        </div>
                    ) : (
                        /* Cart Items */
                        <div className="space-y-0">
                            <AnimatePresence mode="popLayout">
                                {cart.map((item, index) => (
                                    <motion.div 
                                        key={item.id}
                                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ 
                                            opacity: 0, 
                                            x: -100, 
                                            scale: 0.8, 
                                            height: 0
                                        }}
                                        transition={{ 
                                            duration: 0.3,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 25,
                                            delay: index * 0.05
                                        }}
                                        layout
                                        layoutId={`cart-item-${item.id}`}
                                        className="flex flex-col items-center justify-around w-full h-[128px] bg-white overflow-hidden"
                                    >
                                            <div className="flex flex-row items-center gap-3 w-full h-[100px]">
                                                <div className="flex-none w-[102px] h-[100px] bg-[#F7F7F7] rounded-md relative overflow-hidden">
                                                    {item.imgUrl ? (
                                                        <SafeImage 
                                                            src={item.imgUrl} 
                                                            alt={item.name}
                                                        />
                                                    ) : null}
                                                    {!item.imgUrl && (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <LogoIcon className="w-10 h-10"/>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-start gap-3 w-[278px] h-[100px] flex-grow">
                                                    {/* Item Info Section */}
                                                    <div className="flex flex-col items-start gap-2 w-full h-[53px] flex-grow">
                                                        {/* Title and Quantity Row */}
                                                        <div className="flex flex-row items-center justify-between gap-2 w-full h-[21px]">
                                                            <span className="font-normal text-base leading-[21px] text-[#4C2E24] font-['Poppins'] truncate">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        {/* Price and Subtotal Row */}
                                                        <div className="flex flex-row items-center justify-between w-full h-[21px]">
                                                            <span className="space-x-2 flex items-center">
                                                                <span className="font-normal text-sm leading-[21px] text-[var(--secondary)] font-['Poppins']">
                                                                    {formatCurrency(item.price)}
                                                                </span>
                                                                <span className="font-bold text-sm text-shadow-lg leading-[21px] text-[var(--primary)] font-['Poppins'] bg-[var(--accent)]/80 px-2 py-1 rounded-full min-w-[24px] text-center">
                                                                    ×{item.quantity}
                                                                </span>
                                                            </span>
                                                            <span className="space-x-2 flex items-center">
                                                                <span className="font-normal text-sm leading-[21px] text-[var(--secondary)] font-['Poppins']">
                                                                    =
                                                                </span>
                                                                <span className="font-bold text-sm leading-[21px] text-[var(--secondary)] font-['Poppins']">
                                                                    {formatCurrency(item.price * item.quantity)}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Controls Section */}
                                                    <div className="flex flex-row justify-end items-end gap-3 w-full h-[35px]">

                                                        {/* Quantity Controls */}
                                                        <div className="flex flex-row justify-between items-center px-[6px] w-[120px] h-[35px] bg-[var(--light-accent)] rounded-[24px]">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="flex flex-col justify-center items-center p-[6px] gap-5 w-[23px] h-[23px] bg-white rounded-[24px] hover:scale-110 hover:bg-[var(--accent)] transition-all"
                                                            >
                                                                <MinusIcon/>
                                                            </button>

                                                            <span className="font-bold text-base leading-[21px] text-[var(--secondary)] font-['Poppins']">
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="flex flex-col justify-center items-center p-[6px] gap-5 w-[23px] h-[23px] bg-white rounded-[24px] hover:scale-110 hover:bg-[var(--accent)] transition-all"
                                                            >
                                                                <PlusIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                <motion.div 
                                                    key={`divider-${index}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: index === cart.length - 1 ? 0 : 1 }}

                                                    transition={{ 
                                                        duration: 0.3,
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 25,
                                                        delay: index * 0.05
                                                    }}
                                                    className="flex h-[1px] border-1 border-b border-dashed border-[var(--secondary)]/20 w-full"
                                                />
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="flex-shrink mb-[40px] border-t-1 border-[var(--secondary)]/20 border-dashed">
                    <div className="flex justify-between h-[39px] text-[var(--secondary)] text-[12px] font-medium px-3 py-[6px] items-end">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between h-[33px] text-[var(--secondary)] text-[12px] font-medium px-3 py-[6px]">
                        <span>Discount</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                    </div>

                    <div className="gap-2 p-3">
                        <DiscountDropdown
                            value={discountCode}
                            onChange={setDiscountCode}
                            onDiscountApplied={handleDiscountApplied}
                            subtotal={subtotal}
                            cartCategoryIds={getCartCategoryIds()}
                            categories={categories}
                        />
                    </div>

                    <div className="border-t-1 border-dashed border-[var(--accent)] h-[124px]">
                        <div className="flex justify-between font-semibold text-[12px] h-[62px] p-3 items-center">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>

                        {/* Place Order Button */}
                        <button 
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0 || isPlacingOrder || !user}
                            className={`w-full py-4 font-black text-[14px] transition-all ${
                                cart.length === 0 || isPlacingOrder || !user
                                    ? 'bg-gray-300 text-[var(--primary)] cursor-not-allowed' 
                                    : 'bg-[var(--accent)] text-[var(--primary)] hover:bg-[var(--accent)]/80 hover:text-shadow-none hover:shadow-lg cursor-pointer text-shadow-lg'
                            }`}
                        >
                            <span>
                                {!user ? 'PLEASE LOGIN TO ORDER' : isPlacingOrder ? 'PLACING ORDER...' : cart.length === 0 ? 'ADD ITEMS TO ORDER' : 'PLACE ORDER'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
    );
}
