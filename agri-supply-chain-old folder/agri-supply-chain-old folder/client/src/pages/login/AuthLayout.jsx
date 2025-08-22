const AuthLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side image */}
      <div className="hidden md:flex flex-1 bg-green-100 items-center justify-center">
        <img
          src="/auth-farm.jpg" // Add an agriculture background image here
          alt="Farm"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right side form */}
      <div className="flex flex-1 flex-col justify-center items-center p-6 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
