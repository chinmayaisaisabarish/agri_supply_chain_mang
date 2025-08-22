const Unauthorized = () => (
    <div className="min-h-screen flex items-center justify-center bg-red-50 text-center px-4">
      <div>
        <h1 className="text-4xl font-bold text-red-700 mb-4">🚫 Access Denied</h1>
        <p className="text-lg text-gray-700">You are not authorized to view this page.</p>
      </div>
    </div>
  );
  
  export default Unauthorized;
  