import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

/* -------- AUTH PAGES -------- */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterAdmin from "./pages/auth/AdminRegister";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Logout from "./pages/auth/Logout";

/* -------- PROTECTED -------- */
import ProtectedRoute from "./routes/Protected";

/* -------- LAYOUT -------- */
import DistributorLayout from "./layouts/DistributorLayout";

/* -------- DISTRIBUTOR PAGES -------- */
import DistributorDashboard from "./pages/distributor/DistributorDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css"
import AddProduct from "./pages/distributor/products/AddProduct";
import AllProducts from "./pages/distributor/products/AllProducts";
import ProductDetails from "./pages/distributor/products/ProductDetails";
import ProductManagementLayout from "./pages/distributor/products/layout/ProductManagementLayout";
import LowStock from "./pages/distributor/products/LowStock";
import OutStock from "./pages/distributor/products/OutStock";
import BulkUpload from "./pages/distributor/products/BulkUploadProducts";
import EditCompanyProfile from "./pages/distributor/EditComProfile";
import CompanyProfile from "./pages/distributor/CompanyProfile";
import EditProduct from "./pages/distributor/products/EditProduct";
import CustomerLayout from "./pages/distributor/CustomerManagement/layouts/Customer.layout";
import CustomerOverview from "./pages/distributor/CustomerManagement/CustomerDetaiilsHub/CustomerOverview";
import CustomerDirectory from "./pages/distributor/CustomerManagement/CustomersDirectory";
import AddCustomer from "./pages/distributor/CustomerManagement/AddCustomer";
import CustomersInsight from "./pages/distributor/CustomerManagement/CustomersInsight";
import OrderLayout from "./pages/distributor/orderManagement/layout/OrderLayout";
import OrdersList from "./pages/distributor/orderManagement/OrdersList";
import PendingOrders from "./pages/distributor/orderManagement/PendingOrders";
import DeliveredOrders from "./pages/distributor/orderManagement/DeliveredOrders";
import CancelledOrders from "./pages/distributor/orderManagement/CancelledOrders";
import ChangePassword from "./pages/distributor/HeaderComponents/ChangePassword";
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/admin/register" element={<RegisterAdmin/>} />
        <Route path="/auth/forgotpassword" element={<ForgotPassword />} />
        <Route path="/auth/resetpassword/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/user/u/change-password" element={<ChangePassword/>}/>
     

        {/* ================= DISTRIBUTOR ROUTES (WITH LAYOUT) ================= */}
        <Route
          path="/distributor"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="dashboard" element={<DistributorDashboard />} />

          {/* Profile */}
          <Route path="profile" element={<CompanyProfile/>} />
          <Route path="profile/edit" element={<EditCompanyProfile />} />
        </Route>
        //product Management
          <Route path="/distributor/products/manage"
           element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <ProductManagementLayout/>
            </ProtectedRoute>
           }
           >
            <Route path="all" element={<AllProducts/>}/>
            <Route path="add" element={<AddProduct/>}/>
            <Route path="all/product/:productId" element={<ProductDetails/>}/>
            <Route path="low-stock" element={<LowStock/>}/>
            <Route path="out-stock" element={<OutStock/>}/>
            <Route path="bulk-upload" element={<BulkUpload/>}/>
            <Route path="edit/:productId" element={<EditProduct />}/>
            </Route>
          //Customer Management
          <Route path="/distributor/customers/manage" element={ <ProtectedRoute allowedRoles={["distributor"]}>
           <CustomerLayout/>
          </ProtectedRoute>}>
          <Route path="add" element={<AddCustomer/>}/>
          <Route path="all" element={<CustomerDirectory/>}/>
          <Route path="c/:customerId" element={<CustomerOverview/>}/>
          <Route path="insights" element={<CustomersInsight/>}/>
          </Route>
      //order management 
      <Route path="/distributor/orders/manage" element={<ProtectedRoute allowedRoles={["distributor"]}>
        <OrderLayout/>
      </ProtectedRoute>}>
      <Route path="all" element={<OrdersList/>}/>
      <Route path="pending" element={<PendingOrders/>}/>
      <Route path="completed" element={<DeliveredOrders/>}/>
      <Route path="cancelled" element={<CancelledOrders/>}/>
       
      </Route>




      </Routes>
     
    </BrowserRouter>
     <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
</>
  );
}

export default App;
