import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";


export default function ProtectedRoute() {
    const {token , loading} = useApp();
    
    if (loading) {
        
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
