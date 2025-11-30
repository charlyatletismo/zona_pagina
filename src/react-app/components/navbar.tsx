import logo_zona from "@/assets/logo.png";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <img src={logo_zona} alt="Zona Atletismo Logo" className="max-w-xs mr-2" />
        <span className="font-semibold text-xl text-gray-800">Zona Atletismo</span>
      </div>
      <div>
        <a href="/" className="text-gray-600 hover:text-gray-800 mx-2">Home</a>
        <a href="/about" className="text-gray-600 hover:text-gray-800 mx-2">About</a>
        <a href="/contact" className="text-gray-600 hover:text-gray-800 mx-2">Contact</a>
      </div>
    </nav>
  );
}
