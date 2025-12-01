"use client";

import { useState, useEffect, ChangeEvent, DragEvent } from "react"; 

// --- Interface cho 1 sản phẩm (Dùng chung) ---
interface Product {
  name: string;
  image: string;
  material: string;
  color: string;
  quantity: number;
  price: number; // TỔNG GIÁ (đơn giá * số lượng)
}

// --- STYLING (Dùng chung) ---
const inputStyles = "w-full border border-gray-300 rounded-md px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent";
const errorInputStyles = "w-full border border-red-500 rounded-md px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";
const selectStyles = `${inputStyles} appearance-none`;
const buttonBaseStyles = "px-6 py-2 text-base rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";
const primaryButtonStyles = `bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
const outlineButtonStyles = `border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-green-500`;


// --- COMPONENT CHÍNH ĐIỀU HƯỚNG ỨNG DỤNG ---
export default function App() {
  // Chỉ quản lý 2 trang nội bộ này trong file hiện tại
  const [currentPage, setCurrentPage] = useState<'book-print' | 'order'>('book-print');

  const navigateTo = (page: string) => {
    setCurrentPage(page as 'book-print' | 'order');
    window.scrollTo(0, 0); 
  };

  const handleNav = (path: string) => {
    if (path === '/dat-in') {
      navigateTo('book-print');
    } else if (path === '/order-page') { 
      navigateTo('order');
    } else {
      // Các link khác sẽ tải lại trang theo đường dẫn thực tế
      window.location.href = path;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage={currentPage} onNav={handleNav} />
      
      {/* Hiển thị component con dựa trên state */}
      {currentPage === 'book-print' && <BookPrintView navigateTo={navigateTo} />}
      {currentPage === 'order' && <OrderView navigateTo={navigateTo} />}
      
      <Footer onNav={handleNav} />
    </div>
  );
}

// =================================================================
// COMPONENT 1: TRANG ĐẶT IN (BookPrintView)
// =================================================================
function BookPrintView({ navigateTo }: { navigateTo: (page: string) => void }) {
  const [material, setMaterial] = useState("PETG");
  const [color, setColor] = useState("Xanh lam");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [price, setPrice] = useState(200000); 

  useEffect(() => {
    const basePrice = 100000;
    setPrice(basePrice * quantity);
  }, [quantity]);

   const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);
    } else {
      setImagePreview(null); 
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
  };

  const createProductData = async (): Promise<Product> => {
    let imageUrl = "https://placehold.co/100x100?text=3D+Model"; // Ảnh mặc định nếu không tải ảnh
    
    // Nếu có file và là file ảnh, chuyển sang Base64 để lưu trữ được
    if (file && file.type.startsWith("image/")) {
      try {
        imageUrl = await fileToBase64(file);
      } catch (err) {
        console.error("Lỗi chuyển đổi ảnh:", err);
      }
    } else if (file) {
        // Nếu là file 3D (stl, obj), dùng icon file làm ảnh đại diện
        imageUrl = "https://placehold.co/100x100?text=STL/OBJ";
    }

    return {
      name: file?.name || "Đặt in theo mẫu",
      image: imageUrl, // Sử dụng ảnh đã xử lý
      material: material,
      color: color,
      quantity: quantity,
      price: price
    };
  };

  const handleAddToCart = async () => {
    const product = await createProductData();
    const cartString = localStorage.getItem("shoppingCart");
    let cart = cartString ? JSON.parse(cartString) : [];
    cart.push(product);
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleGoToPayment = async () => {
    try {
      const product = await createProductData();
      const checkoutData = {
        products: [product], 
        shippingFee: 50000,
        tax: 15000
      };
      localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
      navigateTo('order'); 
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };

  return (
    <main className="w-full flex-grow p-4 flex justify-center"> 
      <div className="w-full max-w-3xl py-12"> 
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Đặt in theo mẫu của bạn
        </h1> 
        {/* <p className="text-lg text-gray-600 mb-10">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit at cupiditate consectetur incidunt eius.
        </p> */}

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            3D model file (.stl, .obj) or Image (.png, .jpg)
          </h2>
          <div 
            className={`border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer
                        ${isDragging ? 'bg-green-50 border-green-500' : 'bg-gray-50 hover:bg-gray-100'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileUploadInput')?.click()}
          >
            <input 
              type="file" 
              id="fileUploadInput" 
              className="hidden" 
              accept=".stl,.obj,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 24l-4.172-4.172a4 4 0 00-5.656 0L18 24m14 0l-4 4m-10-4l-4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18 32h12M30 20h4v4h-4z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="#34D399"/>
              <path d="M24 12l-4 4h8l-4-4zM20 16h8v4h-8z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="#34D399"/>
            </svg>
            <span className="mt-2 block font-semibold text-gray-700">
              {file ? file.name : 'Nhấn để tải lên'}
            </span>
            <p className="text-sm text-gray-500">hoặc kéo và thả file</p>
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Tùy chọn in</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chất liệu</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className={selectStyles}>
                <option value="PETG">PETG</option>
                <option value="PLA">PLA</option>
                <option value="ABS">ABS</option>
                <option value="Resin">Resin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
              <select value={color} onChange={(e) => setColor(e.target.value)} className={selectStyles}>
                <option value="Xanh lam">Xanh lam</option>
                <option value="Đỏ">Đỏ</option>
                <option value="Đen">Đen</option>
                <option value="Trắng">Trắng</option>
                <option value="Trong suốt">Trong suốt</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className={inputStyles} min="1"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputStyles} h-32`} placeholder="Ghi chú thêm (ví dụ: in rỗng 20%,...)"/>
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-6">
          <div>
            <p className="text-sm text-gray-600">Giá tiền</p>
            <p className="text-2xl font-bold text-green-600">
              {price.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <button type="button" onClick={handleAddToCart} className={`${buttonBaseStyles} ${outlineButtonStyles}`}>
            Thêm vào giỏ
          </button>
          <button type="button" onClick={handleGoToPayment} className={`${buttonBaseStyles} ${primaryButtonStyles}`}>
            Đến trang thanh toán
          </button>
        </div>
      </div> 
    </main> 
  );
}

// =================================================================
// COMPONENT 2: TRANG HOÀN TẤT ĐƠN HÀNG (OrderView)
// =================================================================
function OrderView({ navigateTo }: { navigateTo: (page: string) => void }) {
  const [products, setProducts] = useState<Product[] | null>(null); 
  const [productsTotal, setProductsTotal] = useState(0); 
  const [shippingFee, setShippingFee] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0); 
  const [email, setEmail] = useState("Nhập email của bạn");
  const [phone, setPhone] = useState("Nhập số điện thoại của bạn");
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản ngân hàng");
  const [city, setCity] = useState("Tp Hồ Chí Minh");
  const [address, setAddress] = useState("Trường Đại học Bách Khoa");
  const [errors, setErrors] = useState<{ email?: string; phone?: string; address?: string }>({});

  useEffect(() => {
    const checkoutDataString = localStorage.getItem("checkoutData");
    if (checkoutDataString) {
      try {
        const checkoutData = JSON.parse(checkoutDataString);
        if (checkoutData.products && Array.isArray(checkoutData.products) && checkoutData.products.length > 0) {
          setProducts(checkoutData.products); 
          setShippingFee(checkoutData.shippingFee || 50000); 
          setTax(checkoutData.tax || 15000);
        } else {
          setProducts([]); 
        }
      } catch (error) { console.error("Không thể đọc dữ liệu checkout:", error); }
    } else {
      setProducts([]); 
    }
  }, []); 

  useEffect(() => {
    if (products) { 
      const newProductsTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);
      const newTotal = newProductsTotal + shippingFee + tax;
      setProductsTotal(newProductsTotal); 
      setTotal(newTotal); 
    }
  }, [products, shippingFee, tax]); 

  const handleOrder = () => {
    const newErrors: { email?: string; phone?: string; address?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = "Email là bắt buộc";
    else if (!emailRegex.test(email)) newErrors.email = "Email không hợp lệ";
    if (!phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!address.trim()) newErrors.address = "Địa chỉ là bắt buộc";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // -----------------------------------------------------
      // LOGIC ĐIỀU HƯỚNG MỚI THEO YÊU CẦU
      // -----------------------------------------------------
      
      // Xóa dữ liệu checkout sau khi đặt thành công (tuỳ chọn, có thể để trang đích xoá)
      localStorage.removeItem("checkoutData"); 

      if (paymentMethod === "Thanh toán khi nhận hàng") {
        // Điều hướng sang trang Result (file riêng)
        window.location.href = '/result'; 
      } else {
        // Điều hướng sang trang Shipment (file riêng)
        window.location.href = '/shipment'; 
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
  };

  if (products === null) {
    return (
      <main className="w-full flex-grow p-4 flex justify-center items-center">
        <h1 className="text-2xl font-semibold text-gray-700">Đang tải dữ liệu đơn hàng...</h1>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="w-full flex-grow p-4 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Không có sản phẩm nào để thanh toán.</h1>
          <button onClick={() => navigateTo('book-print')} className={`${buttonBaseStyles} ${primaryButtonStyles} mt-4`}>
            Quay lại trang Đặt in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex-grow p-4 flex justify-center"> 
      <div className="w-full max-w-3xl py-8"> 
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
          Hoàn tất đơn hàng
        </h1> 
        <div className="mb-10"> 
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Đơn hàng</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {products.map((product, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-4 p-5 ${index < products.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded border border-gray-200" />
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">Chất liệu: {product.material}</p>
                  <p className="text-sm text-gray-600">Màu sắc: {product.color}</p>
                  <p className="text-sm text-gray-600">Số lượng: {product.quantity}</p>
                </div>
                <p className="font-semibold text-lg text-gray-900 whitespace-nowrap">
                  {product.price.toLocaleString('vi-VN')} đ 
                </p>
              </div>
            ))}
            <div className="p-5 space-y-2 text-gray-700 bg-gray-50">
              <div className="flex justify-between">
                <span>Tổng giá sản phẩm</span>
                <span className="text-gray-900 font-medium">{productsTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span className="text-gray-900 font-medium">{shippingFee.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between pb-3">
                <span>Thuế</span>
                <span className="text-gray-900 font-medium">{tax.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-xl">
                <span>Tổng cộng</span>
                <span className="text-green-600">{total.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div> 

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin thanh toán</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} className={errors.email ? errorInputStyles : inputStyles} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="tel" placeholder="Số điện thoại" value={phone} onChange={handlePhoneChange} className={errors.phone ? errorInputStyles : inputStyles} />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hình thức thanh toán</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectStyles}>
                <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                <option value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={selectStyles}>
                <option value="Tp Hồ Chí Minh">Tp Hồ Chí Minh</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 top-7 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input type="text" placeholder="Địa chỉ" value={address} onChange={handleAddressChange} className={errors.address ? errorInputStyles : inputStyles} />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
          <div className="flex justify-end mt-8 gap-4">
            <button type="button" onClick={() => navigateTo('book-print')} className={`${buttonBaseStyles} ${outlineButtonStyles}`}>
              Trở lại
            </button>
            <button type="button" onClick={handleOrder} className={`${buttonBaseStyles} ${primaryButtonStyles}`}>
              Đặt hàng
            </button>
          </div>
        </div>
      </div> 
    </main> 
  );
}

// --- COMPONENT HEADER (Chung) ---
const Header = ({ currentPage, onNav }: { currentPage: string, onNav: (path: string) => void }) => {
  // const Logo = () => (
  //   <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M18 0L3 5.3V25.3L18 30.6L33 25.3V5.3L18 0Z" fill="#34D399"/>
  //     <path d="M18 10.6L9.5 15.3V22.6L18 27.3L26.5 22.6V15.3L18 10.6Z" fill="white"/>
  //     <path d="M3 5.3L18 10.6L33 5.3" stroke="#10B981" strokeWidth="1.5"/>
  //     <path d="M18 30.6V10.6" stroke="#10B981" strokeWidth="1.5"/>
  //     <line x1="3" y1="25.3" x2="18" y2="18" stroke="#10B981" strokeWidth="1.5"/>
  //     <line x1="33" y1="25.3" x2="18" y2="18" stroke="#10B981" strokeWidth="1.5"/>
  //   </svg>
  // );
  const Logo = () => (
    <img 
      src="/logo.png" // <-- Đặt file ảnh của bạn vào thư mục 'public' và sửa tên tại đây
      alt="3D Printer Logo" 
      className="w-8 h-8 object-contain"
    />
  );
  const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 hover:text-gray-900">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.121 0 .239.04.328.117l.898.788c.17.15.24.37.24.59v.342c0 .22-.07.441-.24.59l-.898.788c-.089.077-.207.117-.328.117H6.611m0 0a3 3 0 01-3 3h15.75m-12.75-3h11.218c.121 0 .239.04.328.117l.898.788c.17.15.24.37.24.59v.342c0 .22-.07.441-.24.59l-.898.788c-.089.077-.207.117-.328.117H6.611m0 0a3 3 0 00-3 3h15.75m-15.75 0h.008v.008H2.25v-.008z" />
    </svg>
  );
  
  // Kiểm tra trang nào đang active
  const isBookPrintActive = currentPage === 'book-print' || currentPage === 'order';

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <button onClick={() => onNav('/')} className="flex items-center gap-2 font-bold text-2xl text-gray-800">
          <Logo />
          <span className="font-bold text-2xl text-gray-800"></span>
        </button>
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNav('/')} className="font-semibold text-gray-700 hover:text-gray-900 text-lg"> 
            Trang chủ
          </button>
          <button 
            onClick={() => onNav('/dat-in')} 
            className={`font-semibold hover:text-green-700 text-lg ${isBookPrintActive ? 'text-green-600' : 'text-gray-700'}`}
          > 
            Đặt in
          </button>
          <button onClick={() => onNav('/kham-pha')} className="font-semibold text-gray-700 hover:text-gray-900 text-lg">
            Khám phá
          </button>
          <button onClick={() => onNav('/lien-he')} className="font-semibold text-gray-700 hover:text-gray-900 text-lg">
            Liên hệ
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNav('/order-page')} className="p-2 rounded-full hover:bg-gray-100">
            <CartIcon />
          </button>
          <button className="font-semibold text-green-600 border border-green-600 rounded-lg px-4 py-2 text-sm hover:bg-green-50">
            Đăng nhập
          </button>
        </div>
      </nav>
    </header>
  );
};

// --- COMPONENT FOOTER (Chung) ---
const Footer = ({ onNav }: { onNav: (path: string) => void }) => {
  // const Logo = () => (
  //   <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M18 0L3 5.3V25.3L18 30.6L33 25.3V5.3L18 0Z" fill="#34D399"/>
  //     <path d="M18 10.6L9.5 15.3V22.6L18 27.3L26.5 22.6V15.3L18 10.6Z" fill="white"/>
  //   </svg>
  // );
  const Logo = () => (
    <img 
      src="/logo.png" 
      alt="3D Printer Logo" 
      className="w-8 h-8 object-contain"
    />
  );
  const FacebookIcon = () => ( <svg className="w-5 h-5 text-gray-500 hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /> </svg> );
  const InstagramIcon = () => ( <svg className="w-5 h-5 text-gray-500 hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fillRule="evenodd" d="M12.315 2.064c-1.606 0-1.79.006-2.426.035-1.588.072-2.67.34-3.618.72a4.92 4.92 0 00-1.77 1.153 4.92 4.92 0 00-1.153 1.77c-.38 1.05-.648 2.03-.72 3.618C2.07 10.21 2.064 10.395 2.064 12s.006 1.79.035 2.426c.072 1.588.34 2.67.72 3.618.375.94 1.153 1.77 1.153 1.77a4.92 4.92 0 001.77 1.153c1.05.38 2.03.648 3.618.72 1.625.029 1.81.035 2.426.035s1.79-.006 2.426-.035c1.588-.072 2.67-.34 3.618-.72.94-.375 1.77-1.153 1.77-1.153a4.92 4.92 0 00-1.153-1.77 4.92 4.92 0 00-1.77-1.153c-1.05-.38-2.03-.648-3.618-.72C14.105 2.07 13.92 2.064 12.315 2.064zM12 7.02c-2.748 0-4.98 2.232-4.98 4.98s2.232 4.98 4.98 4.98 4.98-2.232 4.98-4.98-2.232-4.98-4.98-2.232-4.98-4.98-4.98zm0 8.01a3.03 3.03 0 110-6.06 3.03 3.03 0 010 6.06zm4.88-8.21a1.17 1.17 0 11-2.34 0 1.17 1.17 0 012.34 0z" clipRule="evenodd" /> </svg> );
  const LinkedInIcon = () => ( <svg className="w-5 h-5 text-gray-500 hover:text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /> </svg> );

  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <button onClick={() => onNav('/')} className="flex items-center gap-2"> <Logo /> <span className="font-bold text-xl text-gray-800"></span> </button>
            <p className="text-gray-600">Công Ty TNHH In 3D</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" aria-label="Facebook"><FacebookIcon /></a>
              <a href="https://instagram.com" aria-label="Instagram"><InstagramIcon /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><LinkedInIcon /></a>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Links</h3>
            <ul className="space-y-1">
              <li><button onClick={() => onNav('/')} className="text-gray-600 hover:text-gray-900">Trang chủ</button></li>
              <li><button onClick={() => onNav('/kham-pha')} className="text-gray-600 hover:text-gray-900">Khám phá</button></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Công ty</h3>
            <ul className="space-y-1">
              <li><button onClick={() => onNav('/ve-chung-toi')} className="text-gray-600 hover:text-gray-900">Về chúng tôi</button></li>
              <li><button onClick={() => onNav('/lien-he')} className="text-gray-600 hover:text-gray-900">Liên hệ</button></li>
              <li><button onClick={() => onNav('/faq')} className="text-gray-600 hover:text-gray-900">FAQ</button></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800">Pháp lý</h3>
            <ul className="space-y-1">
              <li><button onClick={() => onNav('/dieu-khoan')} className="text-gray-600 hover:text-gray-900">Điều khoản của dịch vụ</button></li>
              <li><button onClick={() => onNav('/chinh-sach-bao-mat')} className="text-gray-600 hover:text-gray-900">Chính sách bảo mật</button></li>
            </ul>
          </div>
        </div>
        <hr className="my-8 border-gray-200" />
        <div className="text-center text-gray-500 text-sm">
          Copyright 2025 © 3D Printer. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};