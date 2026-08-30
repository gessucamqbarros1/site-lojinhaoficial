
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductsTab from '@/components/admin/ProductsTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import SettingsTab from '@/components/admin/SettingsTab';
import BackupTab from '@/components/admin/BackupTab';

const Admin = () => {
  const { user, loading, isAdmin, roleLoading, signOut } = useAuth();
  const {
    storeData,
    setStoreData,
    productList,
    setProductList,
    categories,
    setCategories,
    uploading,
    setUploading,
    saving,
    setSaving,
    deleting,
    setDeleting,
    fetchProducts,
    fetchStoreSettings,
    generateWhatsAppLink,
    toast
  } = useAdminData();

  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
      fetchStoreSettings();
    }
    // fetchProducts/fetchStoreSettings come from useAdminData() and aren't
    // memoized, so including them here would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi deslogado com sucesso",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vintage-background">
        <p className="text-vintage-brown">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vintage-background px-4">
        <div className="admin-card p-8 max-w-md text-center">
          <h1 className="text-2xl font-playfair text-vintage-brown mb-3">Acesso negado</h1>
          <p className="text-vintage-dark/80 mb-6">
            Sua conta está autenticada, mas não tem permissão de administrador nesta loja.
          </p>
          <button onClick={signOut} className="admin-button py-2 px-4">
            Sair
          </button>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'products':
        return (
          <ProductsTab
            productList={productList}
            setProductList={setProductList}
            categories={categories}
            fetchProducts={fetchProducts}
            generateWhatsAppLink={generateWhatsAppLink}
            uploading={uploading}
            setUploading={setUploading}
            saving={saving}
            setSaving={setSaving}
            toast={toast}
          />
        );
      case 'categories':
        return (
          <CategoriesTab
            categories={categories}
            setCategories={setCategories}
            toast={toast}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            storeData={storeData}
            setStoreData={setStoreData}
            uploading={uploading}
            setUploading={setUploading}
            saving={saving}
            setSaving={setSaving}
            fetchStoreSettings={fetchStoreSettings}
            toast={toast}
          />
        );
      case 'backup':
        return (
          <BackupTab
            productList={productList}
            storeData={storeData}
            setProductList={setProductList}
            setStoreData={setStoreData}
            fetchProducts={fetchProducts}
            fetchStoreSettings={fetchStoreSettings}
            saving={saving}
            setSaving={setSaving}
            deleting={deleting}
            setDeleting={setDeleting}
            toast={toast}
          />
        );
      default:
        return <ProductsTab productList={productList} setProductList={setProductList} categories={categories} fetchProducts={fetchProducts} generateWhatsAppLink={generateWhatsAppLink} uploading={uploading} setUploading={setUploading} saving={saving} setSaving={setSaving} toast={toast} />;
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-vintage-background flex relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-[70] md:hidden bg-white p-2 rounded-lg shadow-lg transition-all duration-200 hover:bg-gray-50"
      >
        <Menu size={18} className="text-vintage-brown" />
      </button>

      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-full overflow-x-hidden">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
